import React from 'react';

/**
 * Componente de Preview de Email da Newsletter
 * Simula a aparência real de um email em clientes como Gmail/Outlook
 * Cores do projeto: brand (#0d345e), accent (#c0392b)
 */

const EmailPreview = ({ campaign, previewMode = 'desktop' }) => {
  const { blocks = [], subject, preheader, senderName } = campaign;

  // Cores do projeto O Investigador
  const colors = {
    brand: '#0d345e',
    brandLight: '#1a4f8a',
    brandDark: '#071d38',
    accent: '#c0392b',
    accentLight: '#e05a4f',
    textDark: '#1a1a1a',
    textMuted: '#666666',
    bgLight: '#f8f9fa',
    border: '#e5e7eb'
  };

  const isMobile = previewMode === 'mobile';
  const containerWidth = isMobile ? '100%' : '600px';
  const padding = isMobile ? '16px' : '24px';
  const fontSize = {
    h1: isMobile ? '24px' : '32px',
    h2: isMobile ? '20px' : '24px',
    h3: isMobile ? '16px' : '18px',
    body: isMobile ? '14px' : '16px',
    small: isMobile ? '12px' : '14px',
    tiny: isMobile ? '10px' : '12px'
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case 'header':
        return (
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ backgroundColor: colors.brandDark }}
          >
            <tbody>
              <tr>
                <td style={{ padding: isMobile ? '20px 16px' : '24px 32px' }}>
                  {/* Logo / Masthead */}
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        <td align="center">
                          <div
                            style={{
                              fontFamily: "'Georgia', serif",
                              color: '#ffffff',
                              fontSize: isMobile ? '28px' : '36px',
                              fontWeight: 'bold',
                              letterSpacing: '-0.5px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {block.content?.siteName || 'O Investigador'}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Arial', sans-serif",
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: fontSize.tiny,
                              letterSpacing: '3px',
                              textTransform: 'uppercase',
                              marginTop: '4px'
                            }}
                          >
                            {block.content?.tagline || 'Jornal Online'}
                          </div>
                        </td>
                      </tr>
                      {/* Data da edição */}
                      <tr>
                        <td align="center" style={{ paddingTop: '16px' }}>
                          <div
                            style={{
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: fontSize.tiny,
                              fontFamily: "'Arial', sans-serif"
                            }}
                          >
                            {new Date().toLocaleDateString('pt-PT', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              {/* Barra accent */}
              <tr>
                <td style={{ backgroundColor: colors.accent, height: '4px' }}></td>
              </tr>
            </tbody>
          </table>
        );

      case 'hero':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ padding: padding, backgroundColor: '#ffffff' }}>
                  {/* Categoria */}
                  {block.content?.category && (
                    <div
                      style={{
                        display: 'inline-block',
                        backgroundColor: colors.accent,
                        color: '#ffffff',
                        fontSize: fontSize.tiny,
                        fontWeight: 'bold',
                        padding: '4px 12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '12px'
                      }}
                    >
                      {block.content.category}
                    </div>
                  )}

                  {/* Titulo Principal */}
                  <h1
                    style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: fontSize.h1,
                      fontWeight: 'bold',
                      color: colors.textDark,
                      lineHeight: '1.2',
                      margin: '0 0 16px 0'
                    }}
                  >
                    {block.content?.title || 'Titulo da Noticia Principal'}
                  </h1>

                  {/* Imagem */}
                  {block.content?.imageUrl ? (
                    <img
                      src={block.content.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        marginBottom: '16px',
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: isMobile ? '180px' : '280px',
                        backgroundColor: colors.bgLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        borderRadius: '4px',
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <span style={{ color: colors.textMuted, fontSize: fontSize.small }}>
                        Imagem em Destaque
                      </span>
                    </div>
                  )}

                  {/* Excerpt */}
                  <p
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.body,
                      color: colors.textMuted,
                      lineHeight: '1.6',
                      margin: '0 0 20px 0'
                    }}
                  >
                    {block.content?.excerpt ||
                      'Resumo da noticia principal que aparece em destaque na newsletter. Este texto deve captar a atencao do leitor e incentiva-lo a clicar para ler mais.'}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={block.content?.link || '#'}
                    style={{
                      display: 'inline-block',
                      backgroundColor: colors.brand,
                      color: '#ffffff',
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.small,
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Ler Artigo Completo
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'section-title':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    padding: `${padding} ${padding} 8px ${padding}`,
                    backgroundColor: '#ffffff'
                  }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        <td
                          style={{
                            borderBottom: `2px solid ${colors.brand}`,
                            paddingBottom: '8px'
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Georgia', serif",
                              fontSize: fontSize.h3,
                              fontWeight: 'bold',
                              color: colors.brand,
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}
                          >
                            {block.content?.title || 'Mais Noticias'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'article':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    padding: `12px ${padding}`,
                    backgroundColor: '#ffffff',
                    borderBottom: `1px solid ${colors.border}`
                  }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        {/* Imagem */}
                        <td
                          width={isMobile ? '100' : '140'}
                          valign="top"
                          style={{ paddingRight: '16px' }}
                        >
                          {block.content?.imageUrl ? (
                            <img
                              src={block.content.imageUrl}
                              alt=""
                              style={{
                                width: isMobile ? '100px' : '140px',
                                height: isMobile ? '70px' : '95px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: isMobile ? '100px' : '140px',
                                height: isMobile ? '70px' : '95px',
                                backgroundColor: colors.bgLight,
                                borderRadius: '4px',
                                border: `1px solid ${colors.border}`
                              }}
                            ></div>
                          )}
                        </td>
                        {/* Conteudo */}
                        <td valign="top">
                          {block.content?.category && (
                            <span
                              style={{
                                color: colors.accent,
                                fontSize: fontSize.tiny,
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {block.content.category}
                            </span>
                          )}
                          <h3
                            style={{
                              fontFamily: "'Georgia', serif",
                              fontSize: fontSize.h3,
                              fontWeight: 'bold',
                              color: colors.textDark,
                              margin: '4px 0 8px 0',
                              lineHeight: '1.3'
                            }}
                          >
                            <a
                              href={block.content?.link || '#'}
                              style={{
                                color: colors.textDark,
                                textDecoration: 'none'
                              }}
                            >
                              {block.content?.title || 'Titulo do Artigo'}
                            </a>
                          </h3>
                          <p
                            style={{
                              fontFamily: "'Arial', sans-serif",
                              fontSize: fontSize.small,
                              color: colors.textMuted,
                              margin: 0,
                              lineHeight: '1.5'
                            }}
                          >
                            {block.content?.excerpt || 'Breve descricao do artigo...'}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'article-list':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ padding: padding, backgroundColor: '#ffffff' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      {(
                        block.content?.articles || [
                          { title: 'Titulo do primeiro artigo da lista' },
                          { title: 'Titulo do segundo artigo da lista' },
                          { title: 'Titulo do terceiro artigo da lista' }
                        ]
                      ).map((article, idx) => (
                        <tr key={idx}>
                          <td
                            style={{
                              padding: '12px 0',
                              borderBottom:
                                idx < (block.content?.articles?.length || 3) - 1
                                  ? `1px solid ${colors.border}`
                                  : 'none'
                            }}
                          >
                            <table width="100%" cellPadding="0" cellSpacing="0">
                              <tbody>
                                <tr>
                                  <td width="24" valign="top">
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: colors.accent,
                                        borderRadius: '50%',
                                        marginTop: '6px'
                                      }}
                                    ></span>
                                  </td>
                                  <td>
                                    <a
                                      href={article.link || '#'}
                                      style={{
                                        fontFamily: "'Georgia', serif",
                                        fontSize: fontSize.body,
                                        color: colors.textDark,
                                        textDecoration: 'none',
                                        lineHeight: '1.4'
                                      }}
                                    >
                                      {article.title}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'text':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ padding: padding, backgroundColor: '#ffffff' }}>
                  <p
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.body,
                      color: colors.textDark,
                      lineHeight: '1.7',
                      margin: 0
                    }}
                  >
                    {block.content?.content || 'Conteudo de texto da newsletter...'}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'quote':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ padding: padding, backgroundColor: '#ffffff' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        <td
                          style={{
                            borderLeft: `4px solid ${colors.accent}`,
                            paddingLeft: '20px',
                            backgroundColor: colors.bgLight,
                            padding: '20px 20px 20px 24px'
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'Georgia', serif",
                              fontSize: fontSize.h3,
                              fontStyle: 'italic',
                              color: colors.textDark,
                              lineHeight: '1.5',
                              margin: '0 0 12px 0'
                            }}
                          >
                            "{block.content?.text || 'Citacao em destaque...'}"
                          </p>
                          {block.content?.author && (
                            <p
                              style={{
                                fontFamily: "'Arial', sans-serif",
                                fontSize: fontSize.small,
                                color: colors.textMuted,
                                margin: 0
                              }}
                            >
                              — {block.content.author}
                            </p>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'button':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td align="center" style={{ padding: padding, backgroundColor: '#ffffff' }}>
                  <a
                    href={block.content?.url || '#'}
                    style={{
                      display: 'inline-block',
                      backgroundColor:
                        block.content?.style === 'outline' ? 'transparent' : colors.brand,
                      color: block.content?.style === 'outline' ? colors.brand : '#ffffff',
                      border: `2px solid ${colors.brand}`,
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.small,
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      padding: '14px 32px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {block.content?.text || 'Ver Mais'}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'divider':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ padding: `8px ${padding}`, backgroundColor: '#ffffff' }}>
                  <hr
                    style={{
                      border: 'none',
                      borderTop:
                        block.content?.style === 'dashed'
                          ? `1px dashed ${colors.border}`
                          : `1px solid ${colors.border}`,
                      margin: 0
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        );

      case 'footer':
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              {/* Social Links Bar */}
              <tr>
                <td
                  style={{
                    backgroundColor: colors.brand,
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: fontSize.small,
                      fontFamily: "'Arial', sans-serif"
                    }}
                  >
                    Siga-nos nas redes sociais
                  </span>
                </td>
              </tr>
              {/* Main Footer */}
              <tr>
                <td
                  style={{
                    backgroundColor: colors.brandDark,
                    padding: isMobile ? '24px 16px' : '32px',
                    textAlign: 'center'
                  }}
                >
                  {/* Logo */}
                  <div
                    style={{
                      fontFamily: "'Georgia', serif",
                      color: '#ffffff',
                      fontSize: fontSize.h2,
                      fontWeight: 'bold',
                      marginBottom: '16px'
                    }}
                  >
                    O Investigador
                  </div>

                  {/* Copyright */}
                  <p
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.tiny,
                      color: 'rgba(255,255,255,0.6)',
                      margin: '0 0 16px 0'
                    }}
                  >
                    {block.content?.copyright ||
                      `© ${new Date().getFullYear()} O Investigador. Todos os direitos reservados.`}
                  </p>

                  {/* Links */}
                  <p
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.tiny,
                      color: 'rgba(255,255,255,0.5)',
                      margin: 0
                    }}
                  >
                    <a
                      href="#"
                      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
                    >
                      Ver no browser
                    </a>
                    {' | '}
                    <a
                      href="#"
                      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
                    >
                      {block.content?.unsubscribeText || 'Cancelar subscricao'}
                    </a>
                    {' | '}
                    <a
                      href="#"
                      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
                    >
                      Preferencias
                    </a>
                  </p>

                  {/* Address */}
                  <p
                    style={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: fontSize.tiny,
                      color: 'rgba(255,255,255,0.4)',
                      margin: '16px 0 0 0'
                    }}
                  >
                    Lisboa, Portugal
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#e5e7eb',
        padding: isMobile ? '8px' : '20px',
        minHeight: '100%'
      }}
    >
      {/* Email Client Header Simulation */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px 8px 0 0',
          padding: '16px',
          borderBottom: `1px solid ${colors.border}`,
          maxWidth: containerWidth,
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: colors.brand,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontFamily: "'Georgia', serif"
            }}
          >
            OI
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {senderName || 'O Investigador'}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>para mim</div>
          </div>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
          {subject || 'Assunto do Email'}
        </div>
        {preheader && <div style={{ fontSize: '14px', color: colors.textMuted }}>{preheader}</div>}
      </div>

      {/* Email Content */}
      <div
        style={{
          maxWidth: containerWidth,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {blocks.map((block, index) => (
          <div key={block.id || index}>{renderBlock(block)}</div>
        ))}

        {/* Empty state */}
        {blocks.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: colors.textMuted
            }}
          >
            <p>Adicione blocos para construir a sua newsletter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPreview;
