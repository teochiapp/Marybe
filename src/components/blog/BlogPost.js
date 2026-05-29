import React from 'react'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiTag } from 'react-icons/fi'
import { getBlogPostBySlug } from '../../data/blogData'

function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return (
      <NotFoundContainer>
        <NotFoundTitle>Artículo no encontrado</NotFoundTitle>
        <NotFoundText>El artículo que buscas no existe o ha sido eliminado.</NotFoundText>
        <BackButton onClick={() => navigate('/')}>
          <FiArrowLeft />
          Volver al inicio
        </BackButton>
      </NotFoundContainer>
    )
  }

  return (
    <BlogPostContainer>
      <TopNavigation>
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <LogoImg src="/logo.png" alt="Logo" />
        </Logo>
        <BackButton onClick={() => navigate('/')}>
          <FiArrowLeft />
          Volver al inicio
        </BackButton>
      </TopNavigation>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PostHeader>
          <PostImage src={post.image} alt={post.title} />
          <PostMeta>
            <CategoryTag>{post.category}</CategoryTag>
            <PostTitle>{post.title}</PostTitle>
            <PostExcerpt>{post.excerpt}</PostExcerpt>
            <MetaInfo>
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
            </MetaInfo>
            <TagsContainer>
              {post.tags.map((tag, index) => (
                <Tag key={index}>
                  <FiTag />
                  {tag}
                </Tag>
              ))}
            </TagsContainer>
          </PostMeta>
        </PostHeader>

        <PostContent>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </PostContent>

        <PostFooter>
          <ShareSection>
            <ShareTitle>Compartir artículo:</ShareTitle>
            <ShareButtons>
              <ShareButton onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                Twitter
              </ShareButton>
              <ShareButton onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                LinkedIn
              </ShareButton>
              <ShareButton onClick={() => navigator.share ? navigator.share({ title: post.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}>
                Compartir
              </ShareButton>
            </ShareButtons>
          </ShareSection>
        </PostFooter>
      </motion.div>
    </BlogPostContainer>
  )
}

export default BlogPost

const BlogPostContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  background-color: var(--background-color, #0A0A0A);
  color: var(--text-color, #E6E6E6);
`

const TopNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
`

const Logo = styled.div`
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const LogoImg = styled.img`
  height: 60px;
  width: 60px;
  object-fit: contain;
  border-radius: 50%;
  
  @media (max-width: 768px) {
    height: 50px;
    width: 50px;
  }
`

const BackButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: var(--text-font, 'Space Grotesk', sans-serif);
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
    transform: translateX(-4px);
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
`

const PostHeader = styled.div`
  margin-bottom: 3rem;
`

const PostImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 2rem;
`

const PostMeta = styled.div`
  text-align: center;
`

const CategoryTag = styled.span`
  background: rgba(102, 211, 250, 0.1);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(102, 211, 250, 0.3);
  display: inline-block;
  margin-bottom: 1rem;
`

const PostTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const PostExcerpt = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`

const MetaInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;

  svg {
    font-size: 1rem;
  }
`

const TagsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const PostContent = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 2.5rem 0 1rem 0;
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 2rem 0 1rem 0;
  }

  p {
    margin-bottom: 1.5rem;
    color: var(--text-color);
    opacity: 0.9;
  }

  ul {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
    color: var(--text-color);
    opacity: 0.9;
  }

  pre {
    background: rgba(18, 26, 46, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    white-space: pre;
    word-wrap: normal;
    min-width: 0;
    
    @media (max-width: 768px) {
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 6px;
      font-size: 0.85rem;
      line-height: 1.4;
      /* Mantener scroll horizontal en lugar de colapsar */
      overflow-x: auto;
      overflow-y: hidden;
      /* Asegurar que el contenido no se rompa */
      white-space: pre;
      word-break: normal;
      -webkit-overflow-scrolling: touch;
    }
  }

  code {
    background: rgba(102, 211, 250, 0.1);
    color: var(--primary-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9rem;
    white-space: nowrap;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
      padding: 0.15rem 0.3rem;
    }
  }

  pre code {
    background: none;
    color: var(--text-color);
    padding: 0;
    white-space: pre;
    word-wrap: normal;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
      line-height: 1.4;
    }
  }

  strong {
    color: var(--primary-color);
    font-weight: 600;
  }
`

const PostFooter = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const ShareSection = styled.div`
  text-align: center;
`

const ShareTitle = styled.h3`
  font-size: 1.2rem;
  font-family: var(--heading-font, 'Red Hat Display', sans-serif);
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
`

const ShareButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`

const ShareButton = styled.button`
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: var(--text-font, 'Space Grotesk', sans-serif);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: var(--background-color);
  }
`

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color, #0A0A0A);
  color: var(--text-color, #E6E6E6);
`

const NotFoundTitle = styled.h1`
  font-size: 2.5rem;
  font-family: var(--heading-font, 'Red Hat Display', sans-serif);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--primary-color);
`

const NotFoundText = styled.p`
  font-size: 1.2rem;
  font-family: var(--text-font, 'Space Grotesk', sans-serif);
  margin-bottom: 2rem;
  opacity: 0.8;
` 