import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	route("setup", "routes/setup.tsx"),
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	route("admin/users", "routes/admin.users.tsx"),
	route("invite", "routes/invite.tsx"),
	route("join/:token", "routes/join.$token.tsx"),
	route("months", "routes/months.tsx"),
	route("months/:monthId", "routes/month.$monthId.tsx"),
	route("months/:monthId/export.csv", "routes/month.$monthId.export.csv.ts"),
	index("routes/home.tsx"),
] satisfies RouteConfig;

