import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/modules/books/application/search-service";
import { GoogleBooksSearchProvider } from "@/modules/books/infrastructure/google-books-search-provider";

function getSearchService() {
  return new SearchService(new GoogleBooksSearchProvider());
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");

  if (!title || !title.trim()) {
    return NextResponse.json(
      { error: "Search title is required" },
      { status: 400 }
    );
  }

  try {
    const service = getSearchService();
    const results = await service.searchByTitle(title.trim());

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Unable to search books at this time. Please try again later." },
      { status: 502 }
    );
  }
}
