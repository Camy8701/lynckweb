import { supabase } from '../lib/supabase'

export const coursesService = {
  // Get all published courses
  async getAllCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (
            full_name,
            avatar_url
          ),
          enrollments (
            id
          ),
          course_ratings (
            rating
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate average ratings and student counts
      const coursesWithStats = data.map(course => ({
        ...course,
        instructor: course.profiles?.full_name || 'Unknown',
        instructor_avatar: course.profiles?.avatar_url,
        students: course.enrollments?.length || 0,
        rating: course.course_ratings?.length 
          ? course.course_ratings.reduce((sum, r) => sum + r.rating, 0) / course.course_ratings.length
          : 0
      }))

      return { data: coursesWithStats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get courses by teacher
  async getCoursesByTeacher(teacherId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments (
            id,
            tier,
            progress
          ),
          course_ratings (
            rating
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate stats
      const coursesWithStats = data.map(course => {
        const enrollments = course.enrollments || []
        const ratings = course.course_ratings || []
        
        return {
          ...course,
          students: enrollments.length,
          rating: ratings.length 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0,
          revenue: enrollments.reduce((sum, enrollment) => {
            const tierPrices = {
              foundation: course.price_foundation || 0,
              advanced: course.price_advanced || 0,
              mastery: course.price_mastery || 0
            }
            return sum + (tierPrices[enrollment.tier] || 0)
          }, 0) / 100 // Convert from cents to dollars
        }
      })

      return { data: coursesWithStats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get single course by ID (simple version for course detail page)
  async getCourseById(courseId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (
            full_name,
            avatar_url
          ),
          course_categories:category_id (
            name
          ),
          enrollments (
            id
          ),
          course_ratings (
            rating
          )
        `)
        .eq('id', courseId)
        .eq('status', 'published')
        .single()

      if (error) throw error

      // Add computed fields
      const courseWithStats = {
        ...data,
        instructor: data.profiles?.full_name || 'Expert Instructor',
        instructor_avatar: data.profiles?.avatar_url,
        category_name: data.course_categories?.name || 'Course',
        total_students: data.enrollments?.length || 0,
        average_rating: data.course_ratings?.length 
          ? data.course_ratings.reduce((sum, r) => sum + r.rating, 0) / data.course_ratings.length
          : 4.8
      }

      return { data: courseWithStats, success: true, error: null }
    } catch (error) {
      console.error('Error in getCourseById:', error)
      return { data: null, success: false, error }
    }
  },

  // Get single course with modules and lessons (detailed version)
  async getCourse(courseId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (
            full_name,
            avatar_url,
            bio
          ),
          course_modules (
            *,
            lessons (
              *
            )
          ),
          course_ratings (
            rating,
            review,
            profiles:student_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', courseId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create new course
  async createCourse(courseData) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update course
  async updateCourse(courseId, updates) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Enroll student in course
  async enrollStudent(studentId, courseId, tier = 'foundation') {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: studentId,
            course_id: courseId,
            tier
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get student's enrolled courses
  async getStudentCourses(studentId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *,
            profiles:teacher_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('student_id', studentId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get course analytics for teacher
  async getCourseAnalytics(teacherId) {
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          enrollments (
            id,
            tier,
            progress,
            created_at
          )
        `)
        .eq('teacher_id', teacherId)

      if (coursesError) throw coursesError

      // Calculate analytics
      const totalRevenue = courses.reduce((sum, course) => {
        return sum + course.enrollments.reduce((courseSum, enrollment) => {
          const tierPrices = {
            foundation: 49,
            advanced: 97,
            mastery: 197
          }
          return courseSum + (tierPrices[enrollment.tier] || 0)
        }, 0)
      }, 0)

      const totalStudents = courses.reduce((sum, course) => sum + course.enrollments.length, 0)

      const completionRates = courses.map(course => {
        const completedEnrollments = course.enrollments.filter(e => e.progress === 100).length
        return course.enrollments.length > 0 ? completedEnrollments / course.enrollments.length : 0
      })

      const averageCompletion = completionRates.length > 0 
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length * 100
        : 0

      return {
        data: {
          totalRevenue,
          totalStudents,
          averageCompletion: Math.round(averageCompletion),
          coursesCount: courses.length,
          enrollmentTrend: courses.map(course => ({
            courseName: course.title,
            enrollments: course.enrollments.map(e => ({
              date: e.created_at,
              tier: e.tier
            }))
          }))
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}