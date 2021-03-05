import Box from "@material-ui/core/Box";

import { Router  } from "@reach/router";
import Navigation from "./navigation";
import './App.css';
import Home from "./pages/home";
import Destinations from "./pages/destinations";
import Search from "./pages/search";
import Finning from './pages/finning';
import Simulation from './pages/simulation';

function App() {
  return (
    <Box className="App" justifyContent="center" alignContent="center" alignItems="center">
      <Navigation></Navigation>
      <Router style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Home path="/" />
        <Destinations path="destinations" />
        <Search path="search" />
        <Finning path="finning" />
        <Simulation path="simulation" />
      </Router>
    </Box>
  );
}

export default App;
