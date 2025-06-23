import { IconButton, Button, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { motion } from "framer-motion";

const neonBaseStyles = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 2,
  bgcolor: "rgba(0, 191, 255, 0.1)",
  color: "#00BFFF",
  border: "1px solid rgba(0, 191, 255, 0.4)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxShadow: "0 0 12px rgba(0, 191, 255, 0.6)",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-75%",
    width: "50%",
    height: "100%",
    background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
    transform: "skewX(-20deg)",
  },
  "&:hover::before": {
    animation: "glint 0.8s ease forwards",
  },
  "@keyframes glint": {
    "0%": { left: "-75%" },
    "100%": { left: "150%" },
  },
  "&:hover": {
    boxShadow: "0 0 20px rgba(0, 191, 255, 0.9)",
    borderColor: "rgba(0, 191, 255, 0.8)",
    color: "#ffffff",
    bgcolor: "rgba(0, 191, 255, 0.2)",
  },
};

export default function NeonButton({ type, tooltipText, onClick, label, sx }) {
  if (type === "infoOutlined") {
    return (
      <Tooltip arrow title={tooltipText || ""}>
        <IconButton size="large" sx={{ ...neonBaseStyles, ...sx }}>
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
    );
  }

  if (type === "searchOutlined") {
    return (
      <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.1 }}>
        <IconButton size="large" onClick={onClick} sx={{ ...neonBaseStyles, ...sx }}>
          <SearchOutlinedIcon fontSize="large" />
        </IconButton>
      </motion.div>
    );
  }

  // normal button
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.1 }}>
      <Button
        onClick={onClick}
        sx={{
          ...neonBaseStyles,
          textTransform: "none",
          fontWeight: "bold",
          fontSize: 14,
          ...sx,
        }}
        variant="contained"
      >
        {label}
      </Button>
    </motion.div>
  );
}
