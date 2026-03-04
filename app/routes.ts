import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	route("health", "routes/health.ts"),
	route("setup", "routes/setup.tsx"),
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	route("join/:token", "routes/join.$token.tsx"),
	route("months/:monthId/export.csv", "routes/month.$monthId.export.csv.ts"),
	layout("routes/_app.tsx", [
		route("admin/users", "routes/admin.users.tsx"),
		route("invite", "routes/invite.tsx"),
		route("account", "routes/account.tsx"),
		route("accounts", "routes/accounts.tsx"),
		route("transactions", "routes/transactions.tsx"),
		route("categories", "routes/categories.tsx"),
		route("months", "routes/months.tsx"),
		route("months/:monthId", "routes/month.$monthId.tsx"),
		index("routes/home.tsx"),
	]),
] satisfies RouteConfig;

