import { useState } from 'react';

const MedicineStock = () => {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol', price: 2.5, unit: 'per gram', stock: 5000 },
    { id: 2, name: 'Ibuprofen', price: 3.8, unit: 'per ml', stock: 3200 },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'per gram',
    stock: ''
  });

  const units = ['per gram', 'per mg', 'per ml', 'per tablet', 'per capsule'];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMedicine = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };
    setMedicines([...medicines, newMedicine]);
    setFormData({ name: '', price: '', unit: 'per gram', stock: '' });
  };

  const handleDelete = (id: number) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Medicine Stock Management</h1>
        
        {/* Add Medicine Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Medicine</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Medicine Name"
              className="p-2 border rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                className="p-2 border rounded-md flex-1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <select
                className="p-2 border rounded-md"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              placeholder="Stock Quantity"
              className="p-2 border rounded-md"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Medicine
            </button>
          </form>
        </div>

        {/* Medicine List Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map(medicine => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{medicine.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${medicine.price.toFixed(2)} <span className="text-gray-500 text-sm">({medicine.unit})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{medicine.stock.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(medicine.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineStock;