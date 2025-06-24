
import { CategoryForm } from './CategoryForm';
import { CategoriesTable } from './CategoriesTable';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';

export function CategoryManagement() {
  const {
    categories,
    isLoading,
    addCategory,
    editCategory,
    removeCategory
  } = useCategoryManagement();

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <CategoryForm onSubmit={addCategory} />
      <CategoriesTable
        categories={categories}
        onEdit={editCategory}
        onDelete={removeCategory}
      />
    </div>
  );
}
