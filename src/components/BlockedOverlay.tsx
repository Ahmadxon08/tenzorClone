export default function BlockedOverlay() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
      <div
        className="
        w-full max-w-lg p-8 rounded-2xl 
        bg-gradient-to-br from-[#0f2a43]/80 to-[#0a1b30]/80 
        border border-white/10 shadow-2xl 
        backdrop-blur-md space-y-8
      "
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-red-400 text-center tracking-wide">
          Sizning profilingiz bloklangan
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-center leading-relaxed text-[15px]">
          Profilingiz administrator tomonidan vaqtincha bloklangan.
          <br />
          Iltimos, administrator bilan bog‘laning.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Telegram */}
          <a
            href="https://t.me/Mukhsin06"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-4 p-4 rounded-xl
              bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60
              border border-blue-500/20 hover:border-blue-500/40
              transition-all group
            "
          >
            <div
              className="
              p-3 rounded-xl 
              bg-gradient-to-br from-blue-500/20 to-blue-600/20 
              border border-blue-500/30 
              group-hover:scale-110 transition-transform
            "
            >
              💬
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                Telegram
              </p>
              <p className="text-white font-semibold">@Mukhsin06</p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+998953900004"
            className="
              flex items-center gap-4 p-4 rounded-xl
              bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60
              border border-green-500/20 hover:border-green-500/40
              transition-all group
            "
          >
            <div
              className="
              p-3 rounded-xl 
              bg-gradient-to-br from-green-500/20 to-green-600/20 
              border border-green-500/30 
              group-hover:scale-110 transition-transform
            "
            >
              📞
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                Telefon
              </p>
              <p className="text-white font-semibold">+998 95 390 00 04</p>
            </div>
          </a>

          {/* Group */}
          <a
            href="https://t.me/jobxadmin"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-4 p-4 rounded-xl
              bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60
              border border-purple-500/20 hover:border-purple-500/40
              transition-all group
            "
          >
            <div
              className="
              p-3 rounded-xl 
              bg-gradient-to-br from-purple-500/20 to-purple-600/20 
              border border-purple-500/30 
              group-hover:scale-110 transition-transform
            "
            >
              👥
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                Admin Guruhi
              </p>
              <p className="text-white font-semibold">@jobxadmin</p>
            </div>
          </a>
        </div>

        {/* User email */}
        {user?.email && (
          <div
            className="
            mt-4 mx-auto w-max px-4 py-2 
            rounded-xl 
            bg-white/5 border border-white/10 
            text-gray-300 text-sm
          "
          >
            {user.email}
          </div>
        )}
      </div>
    </div>
  );
}
