import { Helmet } from "react-helmet-async";
import { toArray } from "../utils/eventFormUtils";
import { kstDateStr } from "../utils/dateUtils";

const formatSchedule = (dateString) => {
  if (!dateString) return "";
  return kstDateStr(dateString);
};

export function EventSeoHelmet({ event }) {
  if (!event) return null;

  const title = `${event.event_name} | ANKR.KR`;
  const genres = toArray(event.genre).join(", ");
  const description = [formatSchedule(event.schedule), event.location, genres]
    .filter(Boolean)
    .join(" · ");

  const imgUrl = event.img_url
    ? event.img_url.replace(/(name=)[^&]*/, "$1large")
    : "https://ankr.kr/og-image.png";

  const url = `https://ankr.kr/event/${event.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.event_name,
    startDate: event.time_start || event.schedule,
    location: { "@type": "Place", name: event.location },
    image: imgUrl,
    url,
    organizer: { "@type": "Organization", name: "ANKR.KR", url: "https://ankr.kr" },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imgUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imgUrl} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
