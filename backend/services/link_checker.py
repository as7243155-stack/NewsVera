import ipaddress
import re
import socket
from urllib.parse import urlparse


class LinkCheckError(Exception):
    """Raised when a link cannot be checked."""


SUSPICIOUS_TLDS = {
    ".zip",
    ".mov",
    ".click",
    ".top",
    ".xyz",
    ".tk",
    ".ml",
    ".ga",
    ".cf",
}

SUSPICIOUS_KEYWORDS = {
    "login",
    "signin",
    "verify",
    "verification",
    "password",
    "account",
    "secure",
    "update",
    "wallet",
    "payment",
    "bank",
    "crypto",
    "claim",
    "gift",
    "prize",
    "free",
    "urgent",
    "confirm",
}

SHORTENER_DOMAINS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "cutt.ly",
    "shorturl.at",
    "ow.ly",
}


def _is_ip_address(hostname: str) -> bool:
    """Return True if the hostname itself is an IPv4 or IPv6 address."""

    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def _is_private_or_reserved(hostname: str) -> bool:
    """
    Resolve a hostname and check whether it points to a private,
    loopback, link-local, multicast, or otherwise reserved address.

    This is important because NewsVera must not blindly fetch
    arbitrary internal network addresses supplied by a user.
    """

    if _is_ip_address(hostname):
        try:
            ip = ipaddress.ip_address(hostname)
            return (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            )
        except ValueError:
            return True

    try:
        addresses = socket.getaddrinfo(
            hostname,
            None,
            type=socket.SOCK_STREAM,
        )
    except socket.gaierror:
        return False

    for address in addresses:
        resolved_ip = address[4][0]

        try:
            ip = ipaddress.ip_address(resolved_ip)

            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                return True

        except ValueError:
            continue

    return False


def _has_suspicious_keywords(url: str) -> list[str]:
    """Find common phishing-style keywords in the URL."""

    lowered = url.lower()
    found = []

    for keyword in SUSPICIOUS_KEYWORDS:
        if re.search(rf"(?<![a-z]){re.escape(keyword)}(?![a-z])", lowered):
            found.append(keyword)

    return sorted(found)


def check_link(url: str) -> dict:
    """
    Perform a local safety analysis of a user-supplied URL.

    This does NOT guarantee that a link is safe.
    It checks URL structure and common risk indicators.
    """

    url = url.strip()

    if not url:
        raise LinkCheckError("Please enter a URL.")

    if len(url) > 2048:
        raise LinkCheckError("The URL is too long to check.")

    parsed = urlparse(url)

    if parsed.scheme.lower() not in {"http", "https"}:
        raise LinkCheckError(
            "Only HTTP and HTTPS links can be checked."
        )

    if not parsed.netloc:
        raise LinkCheckError(
            "This does not appear to be a valid website URL."
        )

    hostname = parsed.hostname

    if not hostname:
        raise LinkCheckError(
            "Could not determine the website domain."
        )

    hostname = hostname.lower().rstrip(".")

    indicators = []
    warnings = []

    # ---------------------------------------------------------
    # HTTPS
    # ---------------------------------------------------------

    is_https = parsed.scheme.lower() == "https"

    if is_https:
        indicators.append("The URL uses HTTPS.")
    else:
        warnings.append(
            "The URL uses HTTP instead of HTTPS."
        )

    # ---------------------------------------------------------
    # IP address
    # ---------------------------------------------------------

    if _is_ip_address(hostname):
        warnings.append(
            "The link uses an IP address instead of a normal domain name."
        )

    # ---------------------------------------------------------
    # Private/internal destination
    # ---------------------------------------------------------

    if _is_private_or_reserved(hostname):
        raise LinkCheckError(
            "This link points to a private or reserved network address "
            "and cannot be checked."
        )

    # ---------------------------------------------------------
    # Suspicious URL characters
    # ---------------------------------------------------------

    if "@" in parsed.netloc:
        warnings.append(
            "The URL contains an @ symbol, which can hide the actual "
            "destination from casual inspection."
        )

    if hostname.count(".") >= 4:
        warnings.append(
            "The domain contains an unusually large number of subdomains."
        )

    if "-" in hostname:
        hyphen_count = hostname.count("-")

        if hyphen_count >= 2:
            warnings.append(
                "The domain contains multiple hyphens."
            )

    # ---------------------------------------------------------
    # Suspicious keywords
    # ---------------------------------------------------------

    suspicious_keywords = _has_suspicious_keywords(url)

    if suspicious_keywords:
        display_keywords = ", ".join(
            suspicious_keywords[:5]
        )

        warnings.append(
            f"The URL contains potentially sensitive keywords: "
            f"{display_keywords}."
        )

    # ---------------------------------------------------------
    # Suspicious TLD
    # ---------------------------------------------------------

    matched_tld = None

    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            matched_tld = tld
            break

    if matched_tld:
        warnings.append(
            f"The domain uses the {matched_tld} top-level domain, "
            f"which NewsVera flags for additional caution."
        )

    # ---------------------------------------------------------
    # URL shortener
    # ---------------------------------------------------------

    is_shortener = hostname in SHORTENER_DOMAINS

    if is_shortener:
        warnings.append(
            "This is a URL-shortening service, so the final destination "
            "is hidden behind the shortened link."
        )

    # ---------------------------------------------------------
    # Long URL
    # ---------------------------------------------------------

    if len(url) > 300:
        warnings.append(
            "The URL is unusually long."
        )

    # ---------------------------------------------------------
    # Encoded characters
    # ---------------------------------------------------------

    if "%" in url:
        indicators.append(
            "The URL contains encoded characters."
        )

    # ---------------------------------------------------------
    # Credentials in URL
    # ---------------------------------------------------------

    if parsed.username or parsed.password:
        warnings.append(
            "The URL contains embedded login credentials."
        )

    # ---------------------------------------------------------
    # Determine risk level
    # ---------------------------------------------------------

    warning_count = len(warnings)

    if warning_count == 0:
        risk_level = "low"
        assessment = "No obvious warning signs detected"

    elif warning_count <= 2:
        risk_level = "medium"
        assessment = "Caution advised"

    else:
        risk_level = "high"
        assessment = "Multiple warning signs detected"

    if not is_https and risk_level == "low":
        risk_level = "medium"
        assessment = "Caution advised"

    # ---------------------------------------------------------
    # Final response
    # ---------------------------------------------------------

    return {
        "success": True,
        "url": url,
        "domain": hostname,
        "scheme": parsed.scheme.lower(),
        "https": is_https,
        "risk_level": risk_level,
        "assessment": assessment,
        "indicators": indicators,
        "warnings": warnings,
        "is_ip_address": _is_ip_address(hostname),
        "is_shortener": is_shortener,
        "suspicious_keywords": suspicious_keywords,
    }