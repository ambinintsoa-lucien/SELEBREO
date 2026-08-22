const PALETTE = ["#FFD43B", "#6B6B6B", "#E8E8E6", "#333333"];

function colorFor(id) {
  if (!id) return PALETTE[0];
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

export default function UserAvatar({ user, size = 40, imgSrc }) {
  const px = `${size}px`;
  if (imgSrc || user?.avatarUrl) {
    return (
      <img
        src={imgSrc || user.avatarUrl}
        alt={user?.username || "avatar"}
        className="avatar object-cover"
        style={{ width: px, height: px }}
      />
    );
  }
  const label = (user?.fullName || user?.username || "?").charAt(0).toUpperCase();
  return (
    <div
      className="avatar"
      style={{ width: px, height: px, background: colorFor(user?.id), fontSize: size * 0.4 }}
    >
      {label}
    </div>
  );
}
