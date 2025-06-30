// components/client/OrderCard.tsx
import Link from "next/link";
import {
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderCardProps {
  order: {
    id: string;
    date: string;
    status: "completed" | "processing" | "cancelled";
    items: OrderItem[];
    total: number;
    trackingNumber?: string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const statusConfig = {
    completed: {
      icon: <FiCheckCircle className="text-green-500" />,
      text: "Completado",
      color: "bg-green-100 text-green-800",
    },
    processing: {
      icon: <FiClock className="text-blue-500" />,
      text: "En proceso",
      color: "bg-blue-100 text-blue-800",
    },
    cancelled: {
      icon: <FiXCircle className="text-red-500" />,
      text: "Cancelado",
      color: "bg-red-100 text-red-800",
    },
  };

  const status = statusConfig[order.status];

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <FiPackage className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pedido #{order.id}
            </h3>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            {status && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                <span className="inline-flex items-center">
                  {status.icon}
                  <span className="ml-1">{status.text}</span>
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between text-sm text-gray-500">
          <div className="flex items-center mt-2 mr-4">
            <FiCalendar className="mr-1" />
            <span>Realizado el {order.date}</span>
          </div>
          <div className="flex items-center mt-2">
            <FiDollarSign className="mr-1" />
            <span className="font-medium">
              Total: ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-5 sm:p-6">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Productos</h4>
        <ul className="space-y-4">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-start">
              {item.image && (
                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className={`${item.image ? "ml-4" : ""} flex-1`}>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-2 sm:mb-0">
            {order.trackingNumber && (
              <p className="text-sm text-gray-500">
                Número de seguimiento:{" "}
                <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/client/orders/${order.id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver detalles
            </Link>
            {order.status === "completed" && (
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver a comprar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
