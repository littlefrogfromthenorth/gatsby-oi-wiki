import { makeStyles } from '@material-ui/core/styles'
import { Link as GatsbyLink } from 'gatsby'
// eslint-disable-next-line
import isAbsoluteURL from 'is-absolute-url'
import React from 'react'
import LinkTooltip from './LinkTooltip'
import path from 'path'

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.link.default,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.link.hover,
    },
    transition: `color ${250}ms ease-in-out`,
  },
}))

/**
 * 修复相对路径的页面链接
 *
 * Example 1:
 * - link: `../a/b/c`, path: `/x/y/`, isIndex: `false`
 * - return: `/x/y/../../a/b/c` (`/a/b/c/`)
 *
 * Example 2:
 * - link: `../a/b/c`, path: `/x/y/`, isIndex: `true`
 * - return: `/x/y/../a/b/c` (`/x/a/b/c/`)
 *
 * 实际上不需要当前页面的 path
 *
 * @param {*} link 要修复的相对路径
 * @param {*} isIndex 当前页面是不是 index（index.md）
 */
function linkFix (link, isIndex) {
  if (/^\//.test(link)) return link // absolute path
  link = link.replace(/\.(md|markdown|mdtext|mdx)/g, '/').replace('index','')
  if (isIndex === false) link = '../' + link
  if (/[^/]$/.test(link) && !/#/.test(link)) {
    link += '/' // append '/' for links, but excluding urls includes `#`.
  }
  return link
}

function getAPIURL(link, pathname, isIndex) {
  if (/[^/]$/.test(pathname)) pathname += '/'
  link = link.replace(/\.(md|markdown|mdtext|mdx)/g, '/').replace(/#(.*?)$/,'')
  if (/^[^/]/.test(link)) {
    if (isIndex === false) link = '../' + link
    link = path.resolve(pathname, link)
  }
  return `https://api.mgt.moe/preview?path=${link}`
}

function RealLink ({ to = '', href = to, children, pathname, isIndex, ...props }) {
  const classes = useStyles()
  if (props?.className?.search('anchor') > -1) {
    return <a {...props} href={href}>{children}</a>
  }
  if (isAbsoluteURL(href)) {
    return (
      <a {...props} href={href} className={classes.link} target="_blank" rel="noopener noreferrer nofollow" >
        {children}
      </a>
    )
  }
  return (
    <LinkTooltip url={getAPIURL(href, pathname, isIndex)} to={linkFix(href, isIndex)}>
      <GatsbyLink {...props} to={linkFix(href, isIndex)} className={classes.link}>
        {children}
      </GatsbyLink>
    </LinkTooltip>
  )
}

function LinkGetter (location, isIndex = false) {
  return function Link (props) {
    return <RealLink {...props} pathname={location.pathname} isIndex={isIndex} />
  }
}

export default LinkGetter
