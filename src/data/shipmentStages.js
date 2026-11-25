const DOCK_OUT = 0.4
const DOCK_IN = 0.84

export const JOURNEY_STEP_THRESHOLDS = [0, 0.12, 0.24, DOCK_OUT, DOCK_IN, 0.92]

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function getShipProgress(p) {
  if (p < DOCK_OUT) return 0
  if (p > DOCK_IN) return 1
  return easeInOutCubic((p - DOCK_OUT) / (DOCK_IN - DOCK_OUT))
}

export function getVoyageDay(p) {
  if (p < DOCK_OUT) return Math.round((p / DOCK_OUT) * 7)
  if (p < DOCK_IN) {
    return 7 + Math.round(((p - DOCK_OUT) / (DOCK_IN - DOCK_OUT)) * 23)
  }
  return 30 + Math.round(((p - DOCK_IN) / (1 - DOCK_IN)) * 5)
}

const shipmentStages = [
  {
    number: '01',
    shortNumber: '1',
    title: 'Source the right factory',
    description:
      'Tell us the product. We shortlist verified manufacturers and get you real prices, not middleman quotes.',
  },
  {
    number: '02',
    shortNumber: '2',
    title: 'Inspect & approve samples',
    description:
      'Our team visits the factory and checks samples. You approve over video call.',
  },
  {
    number: '03',
    shortNumber: '3',
    title: 'Quality check & loading',
    description:
      'Every carton is checked and counted. Then the cranes load your container onto the ship.',
  },
  {
    number: '04',
    shortNumber: '4',
    title: 'Ocean freight',
    description:
      'Your container sails from Shanghai to India, and we track it the whole way.',
  },
  {
    number: '05',
    shortNumber: '5',
    title: 'Customs clearance',
    description:
      'Duties, GST and paperwork are handled at the Indian port, so the container is released quickly.',
  },
  {
    number: '06',
    shortNumber: '6',
    title: 'Delivered to your door',
    description:
      'The container is unloaded and trucked to your shop, warehouse or site.',
  },
]

export default shipmentStages
