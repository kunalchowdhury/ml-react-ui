import './App.css';
import { React, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import JSONtoTable from './JSONtoTable';
import Spinner from './Spinner';
import modelImg from './model_summary.png';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function App() {

  const [data,setData]=useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [jsonToTableData, setJsonToTableData] = useState([]);
  const [plotImg, setPlotImg] = useState([]);

  const getData=()=>{
    fetch('./data.json'
    ,{
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }
    )
      .then(function(response){
        return response.json();
      })
      .then(function(myJson) {
        setData(myJson)
      });
  }

  useEffect(()=>{
    getData()
  },[])

  function handleClick(){
    setIsLoading(true);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
      };
  fetch('http://54.152.131.225:5000/evaluate', requestOptions)
      .then(response => response.json())
      .then((text) => {
        setJsonToTableData(text.data);
        setPlotImg(text.pltImg)
        setIsLoading(false);
       
        let res = document.getElementById("flask-resp");
        let resimg = document.getElementById("flask-resp-img");

        console.log(res);
        
        if(res.style.display === "none")
        {
          res.style.display = "flex";
          resimg.style.display = "flex";
        }
        else
        {
          res.style.display = "none";
          resimg.style.display = "none";
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
    });
  }
  
  function showStaticData() {
    let table = document.getElementById("static-data-table");
    if (table.style.display === "none") {
      table.style.display = "table";
    } else {
      table.style.display = "none";
    }
  }

  return (
    <div className='container'>
      <div style={{backgroundColor: "darkblue",height:"10%"}}>
        <h1 style={{textAlign: "center", color: "white"}}>Derivative Pricing</h1>
      </div>
      <div className='section1' style={{display: "flex", flexDirection: "column"}}>
        <div className="sec1headerwrapper" style={{display: "flex", flexDirection: "row",alignItems: "center"}}>
          <div>
            <h4 style={{paddingLeft: "10px"}}>TRAINED MODEL SUMMARY</h4>
          </div> 
        </div>
        
        <div style={{alignSelf: "center"}}>
          {
            <img style={{width: "500px", margin: "10px"}} id='plot-image' src={modelImg} alt=''>

            </img>}
        </div>
      </div>

      <div className='section2' style={{display: "flex", flexDirection: "column"}}>
        <div className='sec2headerwrapper' style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
        <h4 style={{paddingLeft: "10px"}}>TEST DATA FOR PRICE PREDICTION</h4>
          <div style={{margin: "10px"}}>
              <Button onClick={showStaticData} variant="contained" color="secondary">
                View Test Data
              </Button>
            </div>
          </div>
              <TableContainer component={Paper} style={{maxWidth: "99%", margin: "10px", overflowX: "auto"}}>
                <Table id="static-data-table" style={{display: "none"}} sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      {data.length > 0 &&
                        Object.keys(data[0]).map((key) => <StyledTableCell key={key} style={{backgroundColor: "black", color: "white"}}>{key.toUpperCase()}</StyledTableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, index) => ( 
                      <StyledTableRow key={index}>
                        {Object.values(row).map((value, index) => (
                          <StyledTableCell  key={index} style={{whiteSpace: "nowrap"}}>{value}</StyledTableCell>
                        ))}
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        </div>

        <div className='section3'>
          <div className='sec3headerwrapper' style={{display: "flex", flexDirection: "row", alignItems: "center"}}>

            <h4 style={{paddingLeft: "10px"}}>PREDICT PRICING WITH TEST DATA</h4>
            <div style={{margin: "10px"}}>            
              <Button onClick={handleClick} disabled={isloading} variant="contained" color="primary" component="span">
                Predict Price
              </Button>
            </div>
            </div>

          {isloading ? <Spinner/> : 
            <div style={{display: "flex", flexDirection: "row"}}>
              <div id='flask-resp' style={{flex:"0 0 50%",padding: "5% 2% 0 0",alignItems: "center"}}>

              {jsonToTableData.length > 0 ? <JSONtoTable data={jsonToTableData} /> : false}
              </div>
              <div id='flask-resp-img' style={{flex:"0 0 50%",padding: "2%",alignItems: "right"}}>
                <img src={plotImg} alt='' style={{width: "500px"}}></img>  {/* hardcoded image link */}
              </div>
            </div>
          }
            
        </div>
    </div>
  );
}

export default App;
