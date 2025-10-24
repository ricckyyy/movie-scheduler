import { NextRequest, NextResponse } from 'next/server';

// 本番環境ではDBを使用することを想定
// 現在はデモとしてメモリに保存（再起動で消える）
let customTheaters: any[] = [];

export async function GET() {
  // 将来的にはDBから取得
  // const theaters = await prisma.customTheater.findMany();
  
  return NextResponse.json({ theaters: customTheaters });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theater } = body;

    if (!theater || !theater.name || !theater.address) {
      return NextResponse.json(
        { error: '映画館名と住所は必須です' },
        { status: 400 }
      );
    }

    // 将来的にはDBに保存
    // const newTheater = await prisma.customTheater.create({ data: theater });
    
    customTheaters.push(theater);

    return NextResponse.json({ theater, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add theater' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Theater ID is required' },
        { status: 400 }
      );
    }

    // 将来的にはDBから削除
    // await prisma.customTheater.delete({ where: { id } });
    
    customTheaters = customTheaters.filter(t => t.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete theater' },
      { status: 500 }
    );
  }
}
