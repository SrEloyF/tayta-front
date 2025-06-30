// src/components/client/products/ProductGrid.tsx
import ProductoCard from './ProductoCard';

interface ProductGridProps {
  products: any[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((producto) => (
        <ProductoCard 
          key={producto.id_item || producto.id}
          producto={{
            id_item: producto.id_item || producto.id,
            nombre: producto.name || producto.nombre,
            precio: producto.price || producto.precio,
            url_img: producto.imagen || producto.url_img,
            estado: producto.estado === 'A' ? 'A' : 'I',
            stock: producto.stock,
            categoria: producto.categoria,
            vendedor: producto.vendedor,
            es_servicio: false,
            rating: producto.rating || 4
          }}
        />
      ))}
    </div>
  );
};