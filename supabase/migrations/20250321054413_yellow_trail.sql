/*
  # Add member documents storage

  1. Changes
    - Create storage bucket for member documents
    - Add policies for authenticated users to manage documents
*/

-- Enable storage
insert into storage.buckets (id, name)
values ('member-documents', 'member-documents');

-- Set up security policies
create policy "Authenticated users can upload member documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'member-documents');

create policy "Authenticated users can view member documents"
on storage.objects for select to authenticated
using (bucket_id = 'member-documents');

create policy "Authenticated users can update member documents"
on storage.objects for update to authenticated
using (bucket_id = 'member-documents')
with check (bucket_id = 'member-documents');

create policy "Authenticated users can delete member documents"
on storage.objects for delete to authenticated
using (bucket_id = 'member-documents');
