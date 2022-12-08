import { Modal } from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const DetailSection = ({ open, setOpen, image, title, deskripsi }) => {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Box display="flex" justifyContent="center">
          <img
            src={image}
            alt="image"
            style={{
              height: 200,
              width: 200,
              // backgroundColor: "red",
            }}
          />
        </Box>

        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{
            mt: 3,
          }}
        >
          {title}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {deskripsi}
        </Typography>
      </Box>
    </Modal>
  );
};

export default DetailSection;
