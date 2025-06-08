-- Create a function to call the Edge Function
create or replace function public.handle_new_message()
returns trigger as $$
begin
  -- Call the Edge Function
  perform
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-contact-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'message', NEW.message
      )
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row
  execute function public.handle_new_message(); 