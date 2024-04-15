import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';

export default function App() {
  return (
    <>
      <Router
        explicitLinks={true}
        preload={false}
        singleFlight={true}
        root={(props) => {
          return (
            <>
              <MetaProvider>
                <Suspense>{props.children}</Suspense>
              </MetaProvider>
            </>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </>
  );
}
