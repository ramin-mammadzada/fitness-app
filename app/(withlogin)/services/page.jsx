"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function ServicesPage() {
  const [data, setData] = useState({
    services: [],
    trainers: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    service: null,
    error: null,
  });
  const [formData, setFormData] = useState(getDefaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function getDefaultForm() {
    return {
      name: "",
      categoryId: "",
      availabilities: [{ day: "", startTime: "", endTime: "", trainerId: "" }],
      subscriptionPlans: [{ entryCount: "", price: "" }],
    };
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [services, trainers, categories] = await Promise.all([
        axios.get("/api/services"),
        axios.get("/api/trainers"),
        axios.get("/api/categories", { params: { page: 1, pageSize: 100 } }),
      ]);
      setData({
        services: services.data.data,
        trainers: trainers.data.data,
        categories: categories.data.data,
      });
    } catch (err) {
      showMessage("error", err.response?.data?.statusMessage || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Parse trainer availability from the data structure
  function parseTrainerAvailability(trainer) {
    if (!trainer.availableDays) return [];

    const dayRanges = trainer.availableDays.split("-");
    const startDay = parseInt(dayRanges[0]);
    const endDay = parseInt(dayRanges[1]);

    const availableDays = [];
    for (let day = startDay; day <= endDay; day++) {
      availableDays.push({
        day: day,
        startTime: trainer.startTime,
        endTime: trainer.endTime,
      });
    }

    return availableDays;
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  function openModal(service = null) {
    setModal({ open: true, service, error: null });
    setFormData(service ? mapServiceToForm(service) : getDefaultForm());
  }

  function closeModal() {
    setModal({ open: false, service: null, error: null });
    setFormData(getDefaultForm());
  }

  function mapServiceToForm(service) {
    return {
      name: service.name,
      categoryId: service.category?.id || "",
      availabilities:
        service.availabilities.length > 0
          ? service.availabilities.map((a) => ({
              id: a.id,
              day: a.day.toString(),
              startTime: a.startTime,
              endTime: a.endTime,
              trainerId: a.trainer?.id || "",
            }))
          : [{ day: "", startTime: "", endTime: "", trainerId: "" }],
      subscriptionPlans:
        service.subscriptionPlans.length > 0
          ? service.subscriptionPlans.map((p) => ({
              id: p.id,
              entryCount: p.entryCount.toString(),
              price: p.price.toString(),
            }))
          : [{ entryCount: "", price: "" }],
    };
  }

  function updateForm(type, key, value, index = null) {
    setFormData((prev) => {
      if (type === "field") return { ...prev, [key]: value };

      const updated = { ...prev, [type]: [...prev[type]] };
      updated[type][index][key] = value;

      // If trainer is changed, reset day selection
      if (type === "availabilities" && key === "trainerId") {
        updated[type][index].day = "";
      }

      return updated;
    });
  }

  function addRow(type) {
    const templates = {
      availabilities: { day: "", startTime: "", endTime: "", trainerId: "" },
      subscriptionPlans: { entryCount: "", price: "" },
    };
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], templates[type]],
    }));
  }

  function removeRow(type, index) {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setModal((prev) => ({ ...prev, error: null }));

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId,
      availabilities: formData.availabilities
        .filter((a) => a.day && a.startTime && a.endTime && a.trainerId)
        .map((a) => ({
          day: Number(a.day),
          startTime: a.startTime,
          endTime: a.endTime,
          trainerId: a.trainerId,
        })),
      subscriptionPlans: formData.subscriptionPlans
        .filter((p) => p.entryCount && p.price)
        .map((p) => ({
          entryCount: Number(p.entryCount),
          price: Number(p.price),
        })),
    };

    try {
      if (modal.service) {
        await axios.patch(`/api/services/${modal.service.id}`, payload);
        showMessage("success", "Xidmət yeniləndi");
      } else {
        await axios.post("/api/services", payload);
        showMessage("success", "Yeni xidmət yaradıldı");
      }
      fetchData();
      closeModal();
    } catch (err) {
      setModal((prev) => ({
        ...prev,
        error: err.response?.data?.statusMessage || err.message,
      }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bu xidməti silmək istədiyinizə əminsiniz?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`/api/services/${id}`);
      showMessage("success", "Xidmət silindi");
      fetchData();
    } catch (err) {
      showMessage("error", err.response?.data?.statusMessage || err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Xidmətlər
              </h1>
              <p className="text-gray-600 mt-2">Bütün xidmətləri idarə edin</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              ✨ Yeni Xidmət
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-xl border-l-4 ${
              message.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            } shadow-md animate-pulse`}
          >
            {message.text}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              trainers={data.trainers}
              onEdit={() => openModal(service)}
              onDelete={() => handleDelete(service.id)}
              deleting={deletingId === service.id}
            />
          ))}
        </div>

        {/* Modal */}
        {modal.open && (
          <Modal
            formData={formData}
            trainers={data.trainers}
            categories={data.categories}
            submitting={submitting}
            error={modal.error}
            isEdit={!!modal.service}
            onChange={updateForm}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onSubmit={handleSubmit}
            onClose={closeModal}
            parseTrainerAvailability={parseTrainerAvailability}
          />
        )}
      </div>
    </div>
  );
}

function Modal({
  formData,
  trainers,
  categories,
  submitting,
  error,
  isEdit,
  onChange,
  onAddRow,
  onRemoveRow,
  onSubmit,
  onClose,
  parseTrainerAvailability,
}) {
  const weekdays = [
    "",
    "Bazar ertəsi",
    "Çərşənbə axşamı",
    "Çərşənbə",
    "Cümə axşamı",
    "Cümə",
    "Şənbə",
    "Bazar",
  ];

  const getSelectedTrainer = (trainerId) => {
    return trainers.find((t) => t.id === trainerId);
  };

  const getAvailableDaysForTrainer = (trainerId) => {
    const trainer = getSelectedTrainer(trainerId);
    if (!trainer) return [];

    return parseTrainerAvailability(trainer).map((avail) => avail.day);
  };

  const getTrainerTimeRange = (trainerId) => {
    const trainer = getSelectedTrainer(trainerId);
    if (!trainer) return null;

    return {
      startTime: trainer.startTime,
      endTime: trainer.endTime,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "✏️ Xidməti Yenilə" : "✨ Yeni Xidmət"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <input
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => onChange("field", "name", e.target.value)}
                placeholder="Xidmət adı..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kateqoriya
              </label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.categoryId}
                onChange={(e) =>
                  onChange("field", "categoryId", e.target.value)
                }
              >
                <option value="">Seçin...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availabilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ⏰ Əlçatan Vaxtlar
            </label>
            <div className="space-y-4">
              {formData.availabilities.map((a, i) => {
                const selectedTrainer = getSelectedTrainer(a.trainerId);
                const availableDays = getAvailableDaysForTrainer(a.trainerId);
                const timeRange = getTrainerTimeRange(a.trainerId);

                return (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {/* Trainer Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Trainer
                        </label>
                        <select
                          required
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          value={a.trainerId}
                          onChange={(e) => {
                            onChange(
                              "availabilities",
                              "trainerId",
                              e.target.value,
                              i
                            );
                          }}
                        >
                          <option value="">Trainer seçin</option>
                          {trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.firstName} {t.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Day Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Gün
                        </label>
                        <select
                          required
                          disabled={!a.trainerId}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={a.day}
                          onChange={(e) =>
                            onChange("availabilities", "day", e.target.value, i)
                          }
                        >
                          <option value="">
                            {a.trainerId ? "Gün seçin" : "Əvvəl trainer seçin"}
                          </option>
                          {availableDays.map((day) => (
                            <option key={day} value={day}>
                              {weekdays[day]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Trainer Available Days Info */}
                    {selectedTrainer && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-700 space-y-1">
                          <div>
                            <span className="font-medium">Trainer:</span>{" "}
                            {selectedTrainer.firstName}{" "}
                            {selectedTrainer.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Əlçatan günlər:</span>{" "}
                            {selectedTrainer.availableDays} (
                            {availableDays
                              .map((day) => weekdays[day])
                              .join(", ")}
                            )
                          </div>
                          <div>
                            <span className="font-medium">Əlçatan vaxt:</span>{" "}
                            {selectedTrainer.startTime} -{" "}
                            {selectedTrainer.endTime}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Başlama vaxtı
                        </label>
                        <input
                          type="time"
                          required
                          disabled={!a.day}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                          value={a.startTime}
                          min={timeRange?.startTime}
                          max={timeRange?.endTime}
                          onChange={(e) =>
                            onChange(
                              "availabilities",
                              "startTime",
                              e.target.value,
                              i
                            )
                          }
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Bitirmə vaxtı
                        </label>
                        <input
                          type="time"
                          required
                          disabled={!a.day}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                          value={a.endTime}
                          min={a.startTime || timeRange?.startTime}
                          max={timeRange?.endTime}
                          onChange={(e) =>
                            onChange(
                              "availabilities",
                              "endTime",
                              e.target.value,
                              i
                            )
                          }
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => onRemoveRow("availabilities", i)}
                          className="w-full h-10 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => onAddRow("availabilities")}
                className="w-full p-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:text-indigo-700 hover:border-indigo-400 font-medium transition-colors"
              >
                + Yeni vaxt əlavə et
              </button>
            </div>
          </div>

          {/* Subscription Plans */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              💎 Abunə Paketləri
            </label>
            <div className="space-y-3">
              {formData.subscriptionPlans.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Giriş sayı"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                    value={p.entryCount}
                    onChange={(e) =>
                      onChange(
                        "subscriptionPlans",
                        "entryCount",
                        e.target.value,
                        i
                      )
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Qiymət (AZN)"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                    value={p.price}
                    onChange={(e) =>
                      onChange("subscriptionPlans", "price", e.target.value, i)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveRow("subscriptionPlans", i)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-lg mx-auto"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddRow("subscriptionPlans")}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Paket əlavə et
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              İmtina
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium"
            >
              {submitting
                ? "⏳ Yüklənir..."
                : isEdit
                ? "✅ Yenilə"
                : "✨ Yarat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceCard({ service, trainers, onEdit, onDelete, deleting }) {
  const weekdays = ["", "B.e", "Ç.a", "Çər", "C.a", "Cüm", "Şən", "Baz"];

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {service.name}
          </h3>
          <p className="text-sm text-indigo-600 font-medium">
            📂 {service.category?.name || "Kateqoriya yoxdur"}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">⏰ Vaxtlar</h4>
          {service.availabilities.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Mövcud deyil</p>
          ) : (
            <div className="space-y-1">
              {service.availabilities.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2"
                >
                  {weekdays[a.day]} {a.startTime}-{a.endTime}
                </div>
              ))}
              {service.availabilities.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{service.availabilities.length - 2} daha
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">💎 Paketlər</h4>
          {service.subscriptionPlans.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Paket yoxdur</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {service.subscriptionPlans.map((p) => (
                <span
                  key={p.id}
                  className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                >
                  {p.entryCount}x - {p.price}₼
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
          >
            ✏️ Redaktə
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
          >
            {deleting ? "⏳" : "🗑️"} Sil
          </button>
        </div>
      </div>
    </div>
  );
}
