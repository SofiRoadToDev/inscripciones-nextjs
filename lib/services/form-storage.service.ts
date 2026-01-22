/**
 * Service para persistir datos del formulario de inscripción en localStorage
 */

const STORAGE_KEY = 'inscripcion_form_data'

export interface FormData {
    alumno?: any
    tutores?: any
    inscripcion?: any
    fichaSalud?: any
}

export const formStorageService = {
    /**
     * Guarda los datos de un tab específico
     */
    saveTabData(tabId: keyof FormData, data: any): void {
        try {
            const currentData = this.getAllFormData()
            currentData[tabId] = data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData))
        } catch (error) {
            console.error('Error saving tab data:', error)
        }
    },

    /**
     * Obtiene los datos de un tab específico
     */
    getTabData(tabId: keyof FormData): any {
        try {
            const allData = this.getAllFormData()
            return allData[tabId] || null
        } catch (error) {
            console.error('Error getting tab data:', error)
            return null
        }
    },

    /**
     * Obtiene todos los datos del formulario
     */
    getAllFormData(): FormData {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            return data ? JSON.parse(data) : {}
        } catch (error) {
            console.error('Error getting all form data:', error)
            return {}
        }
    },

    /**
     * Limpia todos los datos del formulario
     */
    clearFormData(): void {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (error) {
            console.error('Error clearing form data:', error)
        }
    },

    /**
     * Verifica si hay datos guardados
     */
    hasData(): boolean {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            return data !== null && data !== '{}'
        } catch (error) {
            return false
        }
    }
}
