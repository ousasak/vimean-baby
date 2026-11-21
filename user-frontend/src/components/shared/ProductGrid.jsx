import React from 'react'
import ProductCard from './ProductCard'
import ScrollReveal from '@/components/common/ScrollReveal'

export default function ProductGrid({ products = [] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <ScrollReveal key={product.id} index={index} className="h-full">
          <ProductCard product={product} />
        </ScrollReveal>
      ))}
    </div>
  )
}
