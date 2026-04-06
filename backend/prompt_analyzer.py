"""
Prompt Risk Analyzer - Context-aware analysis using comprehensive risk dataset
Properly distinguishes between safe and harmful prompts.
"""

import re
from typing import Dict, List, Tuple
from risk_dataset import RISK_CATEGORIES, SEVERITY_ORDER


class PromptAnalyzer:
    """
    Analyzes prompts for harmful content using a comprehensive dataset
    with context-aware safe patterns to avoid false positives.
    
    Key improvement over naive keyword matching:
    - Checks for safe context words that neutralize dangerous keywords
    - Uses weighted scoring across 12 risk categories
    - Only flags genuinely harmful prompts
    """

    def __init__(self):
        self.categories = RISK_CATEGORIES

    def analyze(self, prompt: str) -> Dict:
        """
        Analyze a prompt for safety risks across all categories.
        
        Returns:
            {
                'risk_score': float (0-1),
                'risk_level': str (SAFE/LOW/MEDIUM/HIGH/CRITICAL),
                'detected_categories': List[Dict],
                'category_scores': Dict[str, Dict],
                'explanation': str,
                'word_count': int,
                'char_count': int,
                'intent_analysis': str,
            }
        """
        prompt_lower = prompt.lower().strip()
        prompt_words = set(prompt_lower.split())

        detected_categories = []
        category_scores = {}
        max_severity = 'NONE'

        for cat_id, cat_config in self.categories.items():
            result = self._evaluate_category(prompt_lower, prompt_words, cat_id, cat_config)
            category_scores[cat_id] = result

            if result['matched'] and result['effective_score'] > 0.15:
                detected_categories.append({
                    'id': cat_id,
                    'label': cat_config['label'],
                    'icon': cat_config['icon'],
                    'score': result['effective_score'],
                    'severity': result['severity'],
                    'matched_indicators': result['matched_indicators'],
                    'safe_context_found': result['safe_context_found'],
                    'neutralized': result['neutralized'],
                })

                if SEVERITY_ORDER.get(result['severity'], 0) > SEVERITY_ORDER.get(max_severity, 0):
                    max_severity = result['severity']

        # Calculate overall risk score
        if detected_categories:
            # Use the max effective score (not average) — a prompt is as dangerous
            # as its most dangerous category
            non_neutralized = [c for c in detected_categories if not c['neutralized']]
            if non_neutralized:
                risk_score = max(c['score'] for c in non_neutralized)
            else:
                # All detected categories were neutralized by safe context
                risk_score = max(c['score'] for c in detected_categories)
        else:
            risk_score = 0.05  # baseline safe

        risk_score = min(risk_score, 1.0)
        risk_level = self._get_risk_level(risk_score)
        intent_analysis = self._analyze_intent(prompt_lower, detected_categories, risk_score)
        explanation = self._generate_explanation(risk_score, risk_level, detected_categories, prompt)

        return {
            'risk_score': round(risk_score, 3),
            'risk_level': risk_level,
            'detected_categories': [
                {
                    'label': c['label'],
                    'icon': c['icon'],
                    'score': round(c['score'], 3),
                    'severity': c['severity'],
                    'neutralized': c['neutralized'],
                    'safe_context_found': c['safe_context_found'],
                    'matched_indicators': c['matched_indicators'][:3],  # top 3
                }
                for c in sorted(detected_categories, key=lambda x: x['score'], reverse=True)
            ],
            'category_scores': {
                cat_id: {
                    'label': self.categories[cat_id]['label'],
                    'icon': self.categories[cat_id]['icon'],
                    'score': round(data['effective_score'], 3),
                    'matched': data['matched'],
                    'neutralized': data.get('neutralized', False),
                }
                for cat_id, data in category_scores.items()
            },
            'explanation': explanation,
            'intent_analysis': intent_analysis,
            'max_severity': max_severity,
            'word_count': len(prompt.split()),
            'char_count': len(prompt),
        }

    def _evaluate_category(self, prompt_lower: str, prompt_words: set,
                           cat_id: str, cat_config: dict) -> Dict:
        """Evaluate a single risk category against the prompt."""
        matched_indicators = []
        raw_score = 0.0
        matched = False

        # Check keywords
        for keyword in cat_config.get('keywords', []):
            if keyword in prompt_lower:
                matched = True
                raw_score = max(raw_score, cat_config['weight'])
                matched_indicators.append(f'Keyword: "{keyword}"')

        # Check regex patterns
        for pattern in cat_config.get('patterns', []):
            try:
                if re.search(pattern, prompt_lower, re.IGNORECASE):
                    matched = True
                    raw_score = max(raw_score, cat_config['weight'])
                    matched_indicators.append(f'Pattern match detected')
            except re.error:
                continue

        # Check for safe contexts that neutralize the match
        safe_context_found = []
        neutralized = False
        if matched:
            for safe_word in cat_config.get('safe_contexts', []):
                if safe_word in prompt_lower:
                    safe_context_found.append(safe_word)

            if safe_context_found:
                # Safe context found — drastically reduce the score
                neutralized = True
                raw_score = raw_score * 0.08  # Reduce to ~8% of original

        effective_score = raw_score
        severity = cat_config['severity'] if not neutralized else 'LOW'

        return {
            'matched': matched,
            'raw_score': raw_score,
            'effective_score': effective_score,
            'severity': severity,
            'matched_indicators': matched_indicators,
            'safe_context_found': safe_context_found,
            'neutralized': neutralized,
        }

    def _get_risk_level(self, score: float) -> str:
        """Determine risk level from score."""
        if score < 0.10:
            return 'SAFE'
        elif score < 0.33:
            return 'LOW'
        elif score < 0.67:
            return 'MEDIUM'
        elif score < 0.85:
            return 'HIGH'
        else:
            return 'CRITICAL'

    def _analyze_intent(self, prompt_lower: str, detected_categories: list,
                        risk_score: float) -> str:
        """Provide an intent analysis of the prompt."""
        if risk_score < 0.10:
            return "The prompt appears to be a safe, legitimate question with no harmful intent detected."

        neutralized_cats = [c for c in detected_categories if c.get('neutralized')]
        harmful_cats = [c for c in detected_categories if not c.get('neutralized')]

        if neutralized_cats and not harmful_cats:
            contexts = []
            for c in neutralized_cats:
                contexts.extend(c.get('safe_context_found', []))
            context_str = ', '.join(contexts[:3])
            return (
                f"The prompt contains words that could appear risky out of context, "
                f"but the presence of safe context ({context_str}) indicates benign intent. "
                f"This is likely a safe, everyday question."
            )

        if harmful_cats:
            cat_labels = [c['label'] for c in harmful_cats[:3]]
            return (
                f"The prompt shows indicators of potentially harmful intent across: "
                f"{', '.join(cat_labels)}. Review carefully before processing."
            )

        return "The prompt has some ambiguous elements but does not clearly indicate harmful intent."

    def _generate_explanation(self, score: float, level: str,
                              categories: list, prompt: str) -> str:
        """Generate human-readable explanation."""
        if level == 'SAFE':
            return "✅ This prompt is safe. No harmful content or intent detected."

        if level == 'LOW':
            neutralized = [c for c in categories if c.get('neutralized')]
            if neutralized:
                return (
                    f"✅ Low risk. Some keywords were detected but neutralized by safe context. "
                    f"The prompt appears to be a legitimate question."
                )
            return "ℹ️ Low risk detected. Minor flags found but likely benign."

        if level == 'MEDIUM':
            cat_labels = [c['label'] for c in categories if not c.get('neutralized')]
            if cat_labels:
                return (
                    f"⚠️ Medium risk detected in: {', '.join(cat_labels)}. "
                    f"The prompt may contain sensitive content that requires review."
                )
            return "⚠️ Medium risk detected. Some content requires review."

        if level == 'HIGH':
            cat_labels = [c['label'] for c in categories if not c.get('neutralized')]
            return (
                f"🔴 High risk detected in: {', '.join(cat_labels)}. "
                f"This prompt contains content that may be harmful or dangerous."
            )

        # CRITICAL
        cat_labels = [c['label'] for c in categories if not c.get('neutralized')]
        return (
            f"🚨 CRITICAL risk detected in: {', '.join(cat_labels)}. "
            f"This prompt contains highly dangerous content."
        )


# Initialize analyzer
analyzer = PromptAnalyzer()
