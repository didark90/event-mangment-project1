export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type EventWithUser = Event & {
  user_name: string;
  user_email: string;
};
