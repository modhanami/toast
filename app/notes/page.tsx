import {createServerClient} from '@/utils/supabase/server'

export default async function Page() {
  const supabase = createServerClient()
  const {data: notes} = await supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}