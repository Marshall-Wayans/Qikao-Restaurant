import React from 'react'

const MenuCard = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-2">{item.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-red-700 font-semibold text-lg">
            ${item.price.toFixed(2)}
          </span>
          <button className="bg-red-700 text-white px-3 py-1 rounded-md hover:bg-red-800 transition-colors text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuCard