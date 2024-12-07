import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';
// import Login from 'shared/Login';
import OrderManagement from './pages/OrderManagement';
import MenuManagement from './pages/MenuManagement';
import Reports from './pages/Reports';
import InventoryManagement from './pages/InventoryManagement';
import PromotionsManagement from './pages/PromotionsManagement';
import HelpDesk from './pages/HelpDesk';

// const PrivateRoute = ({ component: Component, ...rest }) => (
//   <Route
//     {...rest}
//     render={props =>
//       localStorage.getItem('token') ? (
//         <Component {...props} />
//       ) : (
//         <Navigate to="/login" />
//       )
//     }
//   />
// );

function App() {
  return (
    // // <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    //   <Router>
    //     <Routes>
    //       {/* <Route path="/login" component={Login} /> */}
    //       <Layout>
    //         <Route exact path="/" component={OrderManagement} />
    //         <Route path="/menu" component={MenuManagement} />
    //         <Route path="/reports" component={Reports} />
    //         <Route path="/inventory" component={InventoryManagement} />
    //         <Route path="/promotions" component={PromotionsManagement} />
    //         <Route path="/helpdesk" component={HelpDesk} />
    //       </Layout>
    //     </Routes>
    //   </Router>
    // </ThemeProvider>
      <ThemeProvider defaultTheme="system" attribute="class" storageKey="vite-ui-theme">
        <Router>
          <Layout>
          <Routes>
            <Route path="/" element={<OrderManagement />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/promotions" element={<PromotionsManagement />} />
            <Route path="/helpdesk" element={<HelpDesk />} />
          </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
  );
}

export default App;

