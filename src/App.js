import { Router  } from "@reach/router";
import Navigation from "./navigation";
import './App.css';
import Home from "./pages/home";
import Destinations from "./pages/destinations";
import Finning from './pages/finning';
import Simulation from './pages/simulation';

function App() {
  return (
    <div className="App">
      <Navigation></Navigation>
      <Router>
        <Home path="/" />
        <Destinations path="destinations" />
        <Finning path="finning" />
        <Simulation path="simulation" />
      </Router>
    </div>
  );
}

export default App;
