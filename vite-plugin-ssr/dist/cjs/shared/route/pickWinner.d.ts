export { pickWinner };
export type { RouteType };
declare type RouteType = 'STRING' | 'FUNCTION' | 'FILESYSTEM';
declare type RouteMatches = {
    precedence?: number | null;
    routeString?: string;
    routeType: RouteType;
};
declare function pickWinner<T extends RouteMatches>(routeMatches: T[]): T | undefined;
//# sourceMappingURL=pickWinner.d.ts.map