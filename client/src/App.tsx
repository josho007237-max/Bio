// client/src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";

import AdminView from "@/pages/admin-view";
import PublicView from "@/pages/public-view";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* ✅ /admin ต้องมาก่อน */}
          <Route path="/admin">
            <AdminView />
          </Route>

          {/* ✅ หน้า public หลัก */}
          <Route path="/">
            <PublicView />
          </Route>
        </Switch>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
