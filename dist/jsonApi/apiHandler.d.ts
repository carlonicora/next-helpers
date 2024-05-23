import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";
export declare function handleRequest(req: NextRequest, res: NextApiResponse, method: string): Promise<Response>;
export declare function GET(req: NextRequest, res: NextApiResponse): Promise<Response>;
export declare function POST(req: NextRequest, res: NextApiResponse): Promise<Response>;
export declare function PATCH(req: NextRequest, res: NextApiResponse): Promise<Response>;
export declare function PUT(req: NextRequest, res: NextApiResponse): Promise<Response>;
export declare function DELETE(req: NextRequest, res: NextApiResponse): Promise<Response>;
