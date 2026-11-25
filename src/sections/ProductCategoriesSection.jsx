import { FlagIcon } from '../components/ui/BrandIcons.jsx'
import LineIcon from '../components/ui/LineIcon.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import productCategories from '../data/productCategories.js'

function ProductCategoriesSection() {
  return (
    <section className="section product-categories" id="products">
      <div className="section-container">
        <SectionHeading
          eyebrow="What we import"
          title={
            <>
              China has a market for every industry.{' '}
              <span className="accent-text">We know each one.</span>
            </>
          }
          description="Each industry has its own manufacturing hub. We take you straight to the source."
        />

        <div className="product-categories__grid">
          {productCategories.map((category, index) => (
            <article
              className={`product-card tilt rv${index % 3 === 1 ? ' d1' : index % 3 === 2 ? ' d2' : ''}`}
              key={category.title}
            >
              <LineIcon
                className="product-card__art"
                name={category.icon}
                strokeWidth={1.2}
              />
              <span className="product-card__hub">
                <FlagIcon country="cn" />
                {category.hub}
              </span>
              <h3>{category.title}</h3>
              <ul>
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="product-card__insight">{category.insight}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategoriesSection
