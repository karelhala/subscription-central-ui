/* eslint-disable prettier/prettier */
import React from 'react';
import { render } from '@testing-library/react';
import SatelliteManifestPage from '../SatelliteManifestPage';
import Authentication from '../../../components/Authentication';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from '../../../store';
import { QueryClient, QueryClientProvider } from 'react-query';
import useSatelliteManifests from '../../../hooks/useSatelliteManifests';
import useUser from '../../../hooks/useUser';
import factories from '../../../utilities/factories';
import { get, def } from 'bdd-lazy-var';

jest.mock('../../../hooks/useSatelliteManifests');
jest.mock('../../../hooks/useUser');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as Record<string, unknown>),
  useLocation: () => ({
    pathname: '/'
  })
}));

const queryClient = new QueryClient();

const SatellitePage = () => (
  <QueryClientProvider client={queryClient}>
    <Authentication>
      <Provider store={init().getStore()}>
        <Router>
          <SatelliteManifestPage />
        </Router>
      </Provider>
    </Authentication>
  </QueryClientProvider>
);

describe('Satellite Manifests Page', () => {
  def('loading', () => false);
  def('error', () => false);
  def('canWriteManifests', () => true);
  def('user', () => {
    return factories.user.build({ canWriteManifests: get('canWriteManifests') });
  });

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({
      isLoading: get('loading'),
      isFetching: false,
      isSuccess: true,
      isError: get('error'),
      data: get('user')
    });

    if (get('error') === false) {
      queryClient.setQueryData('user', get('user'));
    }
  });
  it('renders correctly with satellite data', async () => {
    window.insights = {};

    (useSatelliteManifests as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [
        {
          name: 'Sputnik',
          type: 'Satellite',
          url: 'www.example.com',
          uuid: '00000000-0000-0000-0000-000000000000',
          version: '1.2.3'
        }
      ]
    });
  });

  describe('when the user status call is still loading', () => {
    def('loading', () => true);

    it('renders loading', async () => {
      window.insights = {};

      (useSatelliteManifests as jest.Mock).mockReturnValue({
        isLoading: true,
        data: [],
        error: false,
        isError: false
      });

      const container = render(<SatellitePage />);
      expect(container).toHaveLoader();
    });
  });

  it('renders loading when it has not received a response back', async () => {
    window.insights = {};

    (useSatelliteManifests as jest.Mock).mockReturnValue({
      isLoading: true,
      data: [],
      error: false,
      isError: false
    });
    const container = render(<SatellitePage />);
    expect(container).toHaveLoader();
  });

  it('renders the empty state when no results are returned', async () => {
    (useSatelliteManifests as jest.Mock).mockReturnValue({
      isLoading: false,
      data: []
    });

    const { getByText } = render(<SatellitePage />);
    expect(getByText('Manifests')).toBeInTheDocument();
  });

  describe('when the user does not have write permissions', () => {
    def('canWriteManifests', () => false);

    it('renders an empty table when the API returns no manifests', async () => {
      window.insights = {};

      (useSatelliteManifests as jest.Mock).mockReturnValue({
        isLoading: false,
        data: []
      });

      const { getByLabelText } = render(<SatellitePage />);

      expect(getByLabelText('Satellite Manifest Table').children.length).toEqual(1);
    });
  });

  it('renders with an error message when an API fails', async () => {
    window.insights = {};
    (useSatelliteManifests as jest.Mock).mockReturnValue({
      isLoading: false,
      error: true,
      data: undefined
    });

    render(<SatellitePage />);

    expect(document.querySelector('.pf-c-empty-state__content').firstChild.textContent);
  });

  describe('when the user call fails', () => {
    def('error', () => true);

    it('renders an error message', async () => {
      window.insights = {};
      (useSatelliteManifests as jest.Mock).mockReturnValue({
        isLoading: false,
        error: true,
        data: undefined
      });

      const { getByText } = render(<SatellitePage />);
      expect(getByText('This page is temporarily unavailable')).toBeInTheDocument();
    });
  });
});
