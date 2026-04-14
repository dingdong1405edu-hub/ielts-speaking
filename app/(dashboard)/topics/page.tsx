import { redirect } from 'next/navigation'

// Redirect /topics → /practice (Topic Practice feature lives at /practice)
export default function TopicsRedirectPage() {
  redirect('/practice')
}
