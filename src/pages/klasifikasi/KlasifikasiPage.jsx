import styled from "@emotion/styled";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Card, CardContent, Grid, LinearProgress, linearProgressClasses, Typography } from "@mui/material";
import "./KlasifikasiStyle.scss";
import { Box } from "@mui/system";
import KlasifikasiLogic from "./KlasifikasiLogic";
import DetailSection from "./section/DetailSection";

const BorderLinearCacarDaunCengkeh = styled(LinearProgress)(({ theme }) => ({
  height: 40,
  width: 400,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#F0F0F0",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#1a90ff",
  },
}));

const BorderLinearEmbunJelaga = styled(LinearProgress)(({ theme }) => ({
  height: 40,
  width: 400,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#F0F0F0",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#D63bd4",
  },
}));

const BorderLinearKutuDaun = styled(LinearProgress)(({ theme }) => ({
  height: 40,
  width: 400,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#F0F0F0",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#fce303",
  },
}));

const KlasifikasiPage = () => {
  const { value, func } = KlasifikasiLogic();
  return (
    <div className="root-klasifikasi">
      <Grid className="container" container>
        <Grid className="grid-1" item xs={6}>
          <div className="preview-image">
            {value.image.preview ? (
              <img id="img" src={value.image.preview} alt="dummy" width="224" height="224" ref={value.imageRef} />
            ) : (
              <div className="text">
                <Typography>Preview Image</Typography>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" style={{ display: "none" }} ref={value.fileInputRef} onChange={func.onChangeUploadImage} />
          {/* <Button
            className="btn-upload"
            variant="contained"
            onClick={uploadClick}
            disabled
          >
            Upload Image
          </Button> */}
          <LoadingButton className="btn-upload" loading={value.loading} variant="contained" onClick={!value.loading ? func.uploadClick : null}>
            {!value.loading ? "Upload Image" : ""}
          </LoadingButton>
        </Grid>
        <Grid className="grid-2" item xs={6}>
          <Card className="card-custom">
            <CardContent>
              <Typography className="title" gutterBottom>
                Statistik
              </Typography>
              <Typography className="label">Cacar Daun Cengkeh</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <BorderLinearCacarDaunCengkeh variant="determinate" value={value.clasify.cacar_daun_cengkeh} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${value.clasify.cacar_daun_cengkeh}%`}</Typography>
                </Box>
              </Box>

              <Typography className="label">Embun Jelaga</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <BorderLinearEmbunJelaga variant="determinate" value={value.clasify.embun_jelaga} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${value.clasify.embun_jelaga}%`}</Typography>
                </Box>
              </Box>

              <Typography className="label">Kutu Daun</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <BorderLinearKutuDaun variant="determinate" value={value.clasify.kutu_daun} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${value.clasify.kutu_daun}%`}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <Button variant="contained" onClick={func.onDetail}>
                  Lihat Detail
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DetailSection open={value.open} setOpen={func.setOpen} title={value.detail.title} deskripsi={value.detail.deskripsi} image={value.detail.image} />
    </div>
  );
};

export default KlasifikasiPage;
