import { Button, Grid, Typography } from "@mui/material";
import "./HomeStyle.scss";
import ilustrationWorker from "../../assets/ilustration-worker.svg";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import { useNavigate } from "react-router-dom";
import { deskripsi, title } from "../../values/Constant";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="root">
      <Grid className="container" container>
        <Grid className="grid1" item xs={7}>
          <Typography className="title">{title}</Typography>
          <Typography className="sub">{deskripsi}</Typography>
          <Button
            className="btn-clasification"
            variant="contained"
            onClick={() => {
              navigate("/klasifikasi");
            }}
          >
            Mulai
          </Button>
        </Grid>
        <Grid className="grid2" item>
          <img className="img-bg" src={ilustrationWorker} alt="" />
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;
