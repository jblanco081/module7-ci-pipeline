import { Outlet, NavLink } from "react-router";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-emerald-700 text-white px-6 py-3 flex items-center gap-6 shadow">
        <span className="font-bold text-lg mr-4">SeedSwap</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm hover:underline ${isActive ? "font-semibold underline" : ""}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/packets"
          className={({ isActive }) =>
            `text-sm hover:underline ${isActive ? "font-semibold underline" : ""}`
          }
        >
          Packets
        </NavLink>
        <NavLink
          to="/claim"
          className={({ isActive }) =>
            `text-sm hover:underline ${isActive ? "font-semibold underline" : ""}`
          }
        >
          Claim
        </NavLink>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
