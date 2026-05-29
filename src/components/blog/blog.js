import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUser, FiArrowRight } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import GradientText from '../GradientText'
import { getBlogPosts } from '../../data/blogData'
import { useLanguage } from '../../contexts/LanguageContext'

function Blog() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const posts = getBlogPosts(t)

  const handleReadMore = (slug) => {
    navigate(`/blog/${slug}`)
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }

  return (
    <BlogContainer id="blog">
      <SectionTitle>
        <GradientText
          colors={["var(--text-color)", "var(--primary-color)", "var(--primary-cyan)", "var(--accent-color)", "var(--text-color)"]}
          animationSpeed={4}
          showBorder={false}
        >
          {t('blog.title', 'Nuestro Blog')}
        </GradientText>
      </SectionTitle>

      <SectionSubtitle>{t('blog.subtitle', 'Exploramos las últimas tendencias y mejores prácticas en desarrollo tecnológico')}</SectionSubtitle>

      <BlogGrid>
        {posts.slice(0, 3).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <BlogCard>
              <BlogImageLink as={Link} to={`/blog/${post.slug}`}>
                <BlogImage src={post.image} alt={post.title} />
              </BlogImageLink>
              <BlogContent>
                <CategoryContainer>
                  <BlogCategory>{post.category}</BlogCategory>
                </CategoryContainer>
                <TitleContainer>
                  <BlogTitleLink as={Link} to={`/blog/${post.slug}`}>
                    {post.title}
                  </BlogTitleLink>
                </TitleContainer>
                <BlogExcerpt>{post.excerpt}</BlogExcerpt>
                <BlogMeta>
                  <MetaItem>
                    <FiUser />
                    <span>{post.author}</span>
                  </MetaItem>
                  <MetaItem>
                    <FiCalendar />
                    <span>{post.date}</span>
                  </MetaItem>
                  <MetaItem>
                    <FiClock />
                    <span>{post.readTime}</span>
                  </MetaItem>
                </BlogMeta>
                <ReadMoreButton onClick={() => handleReadMore(post.slug)}>
                  {t('blog.readMore', 'Leer más')}
                  <FiArrowRight />
                </ReadMoreButton>
              </BlogContent>
            </BlogCard>
          </motion.div>
        ))}
      </BlogGrid>
    </BlogContainer>
  )
}

export default Blog

const BlogContainer = styled.section`
  padding: 5rem 2rem;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const SectionTitle = styled.h2`
  font-size: 2.6rem;
  margin-bottom: 1rem;
  text-align: center;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 3px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
`

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const BlogCard = styled.div`
  background: rgba(18, 26, 46, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    border-color: var(--primary-color);
    box-shadow: 0 20px 40px rgba(102, 211, 250, 0.2);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
  @media (max-width: 480px) {
    border-radius: 8px;
  }
`

const BlogImageLink = styled(Link)`
  display: block;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
`

const BlogImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${BlogImageLink}:hover & {
    transform: scale(1.05);
  }

  @media (max-width: 1024px) {
    height: 160px;
  }
  @media (max-width: 600px) {
    height: 120px;
  }
`

const BlogContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1024px) {
    padding: 1rem;
  }
  @media (max-width: 600px) {
    padding: 0.7rem;
  }
`

const CategoryContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  text-align: center;
`

const TitleContainer = styled.div`
  display: block;
  margin-bottom: 0.75rem;
  text-align: center;
`

const BlogCategory = styled.span`
  background: rgba(102, 211, 250, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(102, 211, 250, 0.3);
  display: inline-block;
  margin-bottom: 1rem;
  width: fit-content;
  clear: both;
  float: none;
`

const BlogTitleLink = styled(Link)`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;
  clear: both;
  float: none;
  word-wrap: break-word;

  &:hover {
    color: var(--primary-color);
  }
`

const BlogExcerpt = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  flex: 1;

  @media (max-width: 1024px) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 600px) {
    font-size: 0.85rem;
    margin-bottom: 0.7rem;
  }
`

const BlogMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;

  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 0.7rem;
  }
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.875rem;

  svg {
    font-size: 1rem;
  }
`

const ReadMoreButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary-color);
  font-family: var(--text-font);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: var(--primary-color);
    color: var(--background-color);
    transform: translateY(-2px);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.1rem;
    font-size: 0.85rem;
  }
  @media (max-width: 600px) {
    padding: 0.5rem 0.7rem;
    font-size: 0.8rem;
  }
` 