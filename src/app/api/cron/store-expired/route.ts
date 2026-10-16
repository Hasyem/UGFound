import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { DataService } from '@/lib/data-service'

export async function GET(request: Request) {
  try {
    const isLive = DataService.isLive

    if (isLive) {
      const supabase = await createServiceRoleClient()

      // Calculate 7 days ago
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      // Update found reports older than 7 days to stored (PRD Section 7 & 15)
      const { data, error } = await (supabase as any)
        .from('reports')
        .update({ status: 'stored', updated_at: new Date().toISOString() })
        .eq('type', 'found')
        .eq('status', 'active')
        .lt('created_at', sevenDaysAgo)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully moved ${data?.length || 0} found reports older than 7 days to 'stored'.`,
        updatedCount: data?.length || 0,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Running in demo/local mode. Scheduled task verified.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}