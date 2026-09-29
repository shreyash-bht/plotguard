from evaluation.data_manager import DataManager
from evaluation.evaluators.evaluator import Evaluator


class EvaluationRunner:
    def __init__(self, data_manager: DataManager, evaluators: Evaluator):
        self._data_manager = data_manager
        self._evaluators = evaluators

    def run(self):
        self._data_manager.cleanup()
        self._data_manager.populate()
        self._data_manager.embed_chunks(1000)
        
        try:
            results = []

            for evaluator in self._evaluators:
                results.append(
                    evaluator.evaluate()
                )

            return results

        finally:
            # self._data_manager.cleanup()
            pass