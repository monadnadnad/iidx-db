import { supabase } from '../utils/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('songs')
    .select('id,title,textage_tag,bpm_min,bpm_max')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
