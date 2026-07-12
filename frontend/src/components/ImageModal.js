 import "./ImageModal.css";

export default function ImageModal({
  image,
  title,
  onClose,
}) {
  return (
    <div
      className="cm-overlay"
      onClick={onClose}
    >
      <div
        className="cm-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "700px",
        }}
      >
        <button
          className="cm-close"
          onClick={onClose}
        >
          ✕
        </button>

        <h2>{title}</h2>

        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            borderRadius: "10px",
            marginTop: "15px",
            maxHeight: "75vh",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}