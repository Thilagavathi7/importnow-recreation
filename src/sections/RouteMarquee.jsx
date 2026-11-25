const routes = [
  ['Yiwu', 'Adilabad'],
  ['Foshan', 'Hyderabad'],
  ['Shenzhen', 'Siddipet'],
  ['Guangzhou', 'Chennai'],
  ['Shanghai', 'Nhava Sheva'],
  ['Guzhen', 'Vizag'],
  ['Ningbo', 'Mumbai'],
]

function RouteMarquee() {
  return (
    <div className="route-marquee" id="routes" aria-label="Example sourcing routes">
      <div className="route-marquee__track">
        {[...routes, ...routes].map(([origin, destination], index) => (
          <span
            className="route-marquee__item"
            key={`${origin}-${destination}-${index}`}
            aria-hidden={index >= routes.length}
          >
            <span>{origin}</span>
            <span className="route-marquee__arrow" aria-hidden="true">
              →
            </span>
            <span>{destination}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default RouteMarquee
