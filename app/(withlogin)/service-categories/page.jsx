"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function CategoriesPage() {
  const [data, setData] = useState({ categories: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState({ open: false, category: null });
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories(data.page);
  }, [data.page]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchCategories(page) {
    setLoading(true);
    try {
      const res = await axios.get("/api/categories", {
        params: { page, pageSize: 6 },
      });
      setData((prev) => ({
        ...prev,
        categories: res.data.data,
        totalPages: res.data.totalPages,
      }));
    } catch (err) {
      showMessage("error", err.response?.data?.statusMessage || err.message);
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text });
  }

  function openModal(category = null) {
    setModal({ open: true, category });
    setFormData(
      category
        ? { name: category.name, description: category.description }
        : { name: "", description: "" }
    );
  }

  function closeModal() {
    setModal({ open: false, category: null });
    setFormData({ name: "", description: "" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modal.category) {
        await axios.patch(`/api/categories/${modal.category.id}`, formData);
        showMessage("success", "Kateqoriya yeniləndi");
      } else {
        await axios.post("/api/categories", formData);
        showMessage("success", "Yeni kateqoriya yaradıldı");
      }
      fetchCategories(data.page);
      closeModal();
    } catch (err) {
      showMessage("error", err.response?.data?.statusMessage || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bu kateqoriyanı silmək istədiyinizə əminsiniz?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`/api/categories/${id}`);
      showMessage("success", "Kateqoriya silindi");
      fetchCategories(data.page);
    } catch (err) {
      showMessage("error", err.response?.data?.statusMessage || err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function changePage(newPage) {
    setData((prev) => ({ ...prev, page: newPage }));
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
                Kateqoriyalar
              </h1>
              <p className="text-gray-600 mt-2">
                Xidmət kateqoriyalarını idarə edin
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              ✨ Yeni Kateqoriya
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

        {/* Categories Grid */}
        {data.categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Hələ kateqoriya yoxdur
            </h3>
            <p className="text-gray-500 mb-6">İlk kateqoriyanızı yaradın</p>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              ✨ İlk Kateqoriya
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => openModal(category)}
                onDelete={() => handleDelete(category.id)}
                deleting={deletingId === category.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => changePage(Math.max(1, data.page - 1))}
              disabled={data.page === 1}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              ←
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-200 ${
                      data.page === pageNum
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                changePage(Math.min(data.totalPages, data.page + 1))
              }
              disabled={data.page === data.totalPages}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              →
            </button>
          </div>
        )}

        {/* Modal */}
        {modal.open && (
          <Modal
            formData={formData}
            submitting={submitting}
            isEdit={!!modal.category}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category, onEdit, onDelete, deleting }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {category.description}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center ml-4">
            <span className="text-2xl">📂</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            ✏️ Redaktə
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {deleting ? "⏳ Silinir..." : "🗑️ Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ formData, submitting, isEdit, onChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "✏️ Kateqoriyanı Redaktə Et" : "✨ Yeni Kateqoriya"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Kateqoriya Adı
            </label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={onChange}
              placeholder="Məsələn: Fitness, Qidalanma, Yoga..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Təsvir
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={onChange}
              placeholder="Bu kateqoriyanın məqsədi və təsviri..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              İmtina
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium transition-all"
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
