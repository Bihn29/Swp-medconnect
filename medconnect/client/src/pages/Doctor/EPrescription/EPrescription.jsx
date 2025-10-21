import { useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useDoctorPrescriptions } from "../../../hooks/useDoctor";
import "./EPrescription.scss";

export default function EPrescription() {
  const { loading, error, refetch } = useDoctorPrescriptions();
  const [isOpen, setIsOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    quantity: "",
    duration: "",
    instructions: "",
    warnings: "",
  });

  const [currentPrescription, setCurrentPrescription] = useState({
    medicines: [],
    patientId: "",
    notes: "",
  });

  const drugInteractions = {
    Paracetamol: ["Warfarin", "Aspirin"],
    Ibuprofen: ["Warfarin", "Aspirin", "Paracetamol"],
    Aspirin: ["Ibuprofen", "Warfarin"],
  };

  const checkDrugInteractions = () => {
    const medicineNames = currentPrescription.medicines.map((m) => m.name);
    const interactions = [];

    for (let i = 0; i < medicineNames.length; i++) {
      for (let j = i + 1; j < medicineNames.length; j++) {
        const drug1 = medicineNames[i];
        const drug2 = medicineNames[j];
        if (drugInteractions[drug1]?.includes(drug2)) {
          interactions.push(`${drug1} tương tác với ${drug2}`);
        }
      }
    }

    return interactions;
  };

  const interactions = checkDrugInteractions();

  const handleAddMedicine = () => {
    if (newMedicine.name && newMedicine.dosage) {
      setCurrentPrescription({
        ...currentPrescription,
        medicines: [
          ...currentPrescription.medicines,
          {
            id: Date.now().toString(),
            ...newMedicine,
          },
        ],
      });
      setNewMedicine({
        name: "",
        dosage: "",
        quantity: "",
        duration: "",
        instructions: "",
        warnings: "",
      });
      setIsOpen(false);
    }
  };

  const handleRemoveMedicine = (id) => {
    setCurrentPrescription({
      ...currentPrescription,
      medicines: currentPrescription.medicines.filter((m) => m.id !== id),
    });
  };

  const handleIssuePrescription = async () => {
    try {
      const response = await fetch("/api/doctors/me/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(currentPrescription),
      });

      if (response.ok) {
        alert("Đơn thuốc đã được phát hành và gửi cho bệnh nhân");
        setCurrentPrescription({
          medicines: [],
          patientId: "",
          notes: "",
        });
        await refetch();
      } else {
        throw new Error("Failed to issue prescription");
      }
    } catch (error) {
      console.error("Error issuing prescription:", error);
      alert("Có lỗi xảy ra khi phát hành đơn thuốc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải đơn thuốc...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Phát hành Đơn thuốc</h3>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm thuốc
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Thêm thuốc vào đơn</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tên thuốc</label>
                <input
                  type="text"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  placeholder="Tên hoạt chất/nhãn"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Hàm lượng</label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="500mg"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Số lượng</label>
                  <input
                    type="text"
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                    placeholder="10 viên"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Thời gian dùng</label>
                <input
                  type="text"
                  value={newMedicine.duration}
                  onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                  placeholder="3 ngày"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Hướng dẫn dùng</label>
                <textarea
                  value={newMedicine.instructions}
                  onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                  placeholder="Uống 1 viên mỗi 4-6 giờ"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cảnh báo/Lưu ý</label>
                <textarea
                  value={newMedicine.warnings}
                  onChange={(e) => setNewMedicine({ ...newMedicine, warnings: e.target.value })}
                  placeholder="Không dùng quá 4g/ngày"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddMedicine} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Thêm thuốc
              </Button>
            </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleAddMedicine}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Thêm thuốc
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {interactions.length > 0 && (
        <Card className="p-4 border-0 shadow-sm bg-red-50 border-l-4 border-red-500">
          <h4 className="font-semibold text-red-700 mb-2">Cảnh báo tương tác thuốc</h4>
          <ul className="space-y-1 text-sm text-red-600">
            {interactions.map((interaction, idx) => (
              <li key={idx}>• {interaction}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-3">
        {currentPrescription.medicines.length === 0 ? (
          <Card className="p-8 text-center border-0 shadow-sm">
            <p className="text-slate-600">Chưa có thuốc nào trong đơn</p>
          </Card>
        ) : (
          currentPrescription.medicines.map((medicine) => (
            <Card key={medicine.id} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{medicine.name}</p>
                  <p className="text-sm text-slate-600">Hàm lượng: {medicine.dosage}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveMedicine(medicine.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <p className="text-slate-600">Số lượng</p>
                  <p className="font-medium text-slate-900">{medicine.quantity}</p>
                </div>
                <div>
                  <p className="text-slate-600">Thời gian</p>
                  <p className="font-medium text-slate-900">{medicine.duration}</p>
                </div>
                <div>
                  <p className="text-slate-600">Hướng dẫn</p>
                  <p className="font-medium text-slate-900">{medicine.instructions}</p>
                </div>
              </div>
              {medicine.warnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-700">
                  <strong>Cảnh báo:</strong> {medicine.warnings}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Button onClick={handleIssuePrescription} className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 py-6">
        <Send className="w-4 h-4" />
        Phát hành đơn thuốc
      </Button>
    </div>
  );
}
