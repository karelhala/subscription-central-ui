import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import Main from '@redhat-cloud-services/frontend-components/Main';
import NotAuthorized from '@redhat-cloud-services/frontend-components/NotAuthorized';

const NoPermissionsPage = () => {
  useEffect(() => {
    insights?.chrome?.appAction?.('no-permissions');
  }, []);

  return (
    <Main>
      <NotAuthorized serviceName="Subscription Central" />
    </Main>
  );
};

export default withRouter(NoPermissionsPage);
