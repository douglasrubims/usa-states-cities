export type Env = {
	kv: KVNamespace;
};

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		const path = url.pathname.split("/").filter((p) => p);

		const states = await env.kv.get<{ name: string; abbreviation: string }[]>(
			"states",
			"json",
		);

		if (!states)
			return Response.json({ message: "States not found" }, { status: 404 });

		if (path.length === 1 && path[0] === "states") return Response.json(states);

		if (path.length === 2 && path[0] === "states") {
			const citiesDatabase = await env.kv.get<
				{
					name: string;
					lat: number;
					lon: number;
					state: string;
				}[]
			>("cities", "json");

			console.log(citiesDatabase);

			if (!citiesDatabase)
				return Response.json({ message: "Cities not found" }, { status: 404 });

			const statePath = decodeURI(path[1].toLowerCase());

			const state = states.find(
				(state) =>
					statePath === state.name.toLowerCase() ||
					statePath === state.abbreviation.toLowerCase(),
			);

			const cities = citiesDatabase
				.filter((city) => state?.abbreviation === city.state)
				.filter(
					(location, index, array) =>
						array.findIndex((obj) => obj.name === location.name) === index,
				);

			return Response.json(cities);
		}

		return Response.json({ message: "Route not found" }, { status: 404 });
	},
};
