create or replace function public.create_next_khatam(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_khatam record;
  reserved_count integer;
  inserted_khatam public.khatams%rowtype;
begin
  select *
  into latest_khatam
  from public.khatams
  where room_id = p_room_id
  order by khatam_number desc
  limit 1;

  if latest_khatam.id is null then
    raise exception 'No Khatam has been created in this Majlis.';
  end if;

  select count(*)
  into reserved_count
  from public.juz_contributions
  where room_id = p_room_id
    and khatam_id = latest_khatam.id;

  if reserved_count < 30 then
    raise exception 'All 30 Juz must be reserved before creating the next Khatam.';
  end if;

  insert into public.khatams (room_id, khatam_number, status)
  values (p_room_id, latest_khatam.khatam_number + 1, 'active')
  returning *
  into inserted_khatam;

  return to_jsonb(inserted_khatam);
end;
$$;

grant execute on function public.create_next_khatam(uuid) to anon, authenticated;
