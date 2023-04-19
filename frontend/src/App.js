import logo from './logo.svg';
import Court from './Court';
import './App.css';
import Dropdown from './Dropdown';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <div>
      <div id="menu">
        <form name="form1" id="form1" action="/action_page.php">
          <span> Game: </span>
            <Dropdown source={"games"} />
          <br />
          <br />
          <span> Player: </span>
            <Dropdown source={"teams"} />
          <br />
          <br />
          <input type="submit" onclick="showDiv()" value="Submit" />
        </form>

        <div id="" stat_panel>
          <p>PPG: </p>
          <p>APG: </p>
          <p>RPG: </p>
        </div>
      </div>
      <Court />
    </div>
  );
}

export default App;
